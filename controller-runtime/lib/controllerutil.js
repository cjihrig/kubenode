import { GroupVersionKind } from './apimachinery/schema.js';

/**
 * @typedef {import('@kubernetes/client-node').KubernetesObject} KubernetesObject
 * @typedef {import('@kubernetes/client-node').V1OwnerReference} V1OwnerReference
 */

/**
 * AlreadyOwnedError is an error thrown when trying to assign a controller to
 * an object that is already owned by another controller.
 */
export class AlreadyOwnedError extends Error {
  /**
   * Construct an AlreadyOwnedError.
   * @param {KubernetesObject} object - Owned Kubernetes object.
   * @param {V1OwnerReference} owner - Kubernetes owner reference.
   */
  constructor(object, owner) {
    const obj = `${object.metadata.namespace}/${object.metadata.name}`;
    const msg = `object '${obj}' is already owned by another ${owner.kind} ` +
      `controller '${owner.name}'`;
    super(msg);
    this.name = 'AlreadyOwnedError';
    this.object = object;
    this.owner = owner;
  }
}

/**
 * addFinalizer() adds a finalizer to a Kubernetes object. If the finalizer
 * already existed on the object, it is not added again. Returns a boolean
 * indicating if the finalizer was added.
 * @param {KubernetesObject} o - Kubernetes object to add the finalizer to.
 * @param {string} finalizer - Finalizer to add.
 * @returns {boolean}
 */
export function addFinalizer(o, finalizer) {
  if (containsFinalizer(o, finalizer)) {
    return false;
  }

  o.metadata.finalizers ??= [];
  o.metadata.finalizers.push(finalizer);
  return true;
}

/**
 * containsFinalizer() returns a boolean indicating if the object contains the
 * specified finalizer.
 * @param {KubernetesObject} o - Kubernetes object to check.
 * @param {string} finalizer - Finalizer to check.
 * @returns {boolean}
 */
export function containsFinalizer(o, finalizer) {
  if (!Array.isArray(o.metadata.finalizers)) {
    return false;
  }

  return o.metadata.finalizers.indexOf(finalizer) !== -1;
}

/**
 * removeFinalizer() removes the specified finalizer from the object if it is
 * present. A boolean is returned indicated if the finalizer was removed.
 * @param {KubernetesObject} o - Kubernetes object to remove the finalizer from.
 * @param {string} finalizer - Finalizer to remove.
 * @returns {boolean}
 */
export function removeFinalizer(o, finalizer) {
  if (!Array.isArray(o.metadata.finalizers)) {
    return false;
  }

  const index = o.metadata.finalizers.indexOf(finalizer);

  if (index === -1) {
    return false;
  }

  o.metadata.finalizers.splice(index, 1);
  return true;
}

/**
 * hasControllerReference() returns true if the object has an owner reference
 * with the controller property set to true.
 * @param {KubernetesObject} o - Kubernetes object to check.
 * @returns {boolean}
 */
export function hasControllerReference(o) {
  return getControllerReference(o) !== null;
}

/**
 * setControllerReference() sets owner as a Controller OwnerReference on object.
 * @param {KubernetesObject} owner - Kubernetes object used as owner.
 * @param {KubernetesObject} object - Kubernetes object that is owned.
 */
export function setControllerReference(owner, object) {
  validateOwner(owner, object);
  const gvk = getObjectGVK(owner);
  /** @type {V1OwnerReference} */
  const ref = {
    apiVersion: gvk.toAPIVersion(),
    kind: gvk.kind,
    name: owner.metadata.name,
    blockOwnerDeletion: true,
    controller: true,
    uid: owner.metadata.uid,
  };
  const existing = getControllerReference(object);

  if (existing !== null) {
    if (!doesReferToSameObject(ref, existing)) {
      throw new AlreadyOwnedError(object, existing);
    }

    return;
  }

  object.metadata.ownerReferences ??= [];
  object.metadata.ownerReferences.push(ref);
}

/**
 * getControllerReference() returns the object's owner reference with the
 * controller property set to true, or null if there is no such reference.
 * @param {KubernetesObject} o - Kubernetes object to check.
 * @returns {V1OwnerReference|null}
 */
function getControllerReference(o) {
  const owners = o.metadata.ownerReferences;

  if (!Array.isArray(owners)) {
    return null;
  }

  for (let i = 0; i < owners.length; ++i) {
    if (owners[i].controller === true) {
      return owners[i];
    }
  }

  return null;
}

/**
 * validateOwner() ensures that ownership constraints between the object and
 * its owner are valid. If they are not, an exception is thrown.
 * @param {KubernetesObject} owner - Owner Kubernetes object.
 * @param {KubernetesObject} object - Owned Kubernetes object.
 */
function validateOwner(owner, object) {
  const ownerNs = owner.metadata.namespace;

  if (!ownerNs) {
    // No validation necessary for cluster-scoped owners.
    return;
  }

  const objectNs = object.metadata.namespace;

  if (!objectNs) {
    const msg = 'cluster-scoped resource must not have a namespace-scoped ' +
      `owner, owner's namespace is '${ownerNs}'`;
    throw new Error(msg);
  }

  if (ownerNs !== objectNs) {
    const msg = 'cross-namespace owner references are disallowed, ' +
      `owner's namespace is '${ownerNs}', ` +
      `object's namespace is '${objectNs}'`;
    throw new Error(msg);
  }
}

/**
 * getObjectGVK() returns the GroupVersionKind of the provided object.
 * @param {KubernetesObject} object - Kubernetes object.
 * @returns {GroupVersionKind}
 */
function getObjectGVK(object) {
  // TODO(cjihrig): This function as not as thorough as the Go function:
  // GVKForObject from sigs.k8s.io/controller-runtime/pkg/client/apiutil
  if (!object.kind) {
    throw new Error('object has no kind');
  }

  if (!object.apiVersion) {
    throw new Error('object has no version');
  }

  return GroupVersionKind.fromAPIVersionAndKind(object.apiVersion, object.kind);
}

/**
 * doesReferToSameObject() returns true if the two references refer to the same
 * object, and false otherwise.
 * @param {V1OwnerReference} a - First owner reference.
 * @param {V1OwnerReference} b - Second owner reference.
 * @returns {boolean}
 */
function doesReferToSameObject(a, b) {
  return a.apiVersion && a.apiVersion === b.apiVersion &&
    a.kind && a.kind === b.kind &&
    a.name && a.name === b.name;
}

export default {
  AlreadyOwnedError,
  addFinalizer,
  containsFinalizer,
  hasControllerReference,
  removeFinalizer,
  setControllerReference,
};
