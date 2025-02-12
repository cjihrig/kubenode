/**
 * @typedef {import('@kubernetes/client-node').KubernetesObject} KubernetesObject
 */

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

export default {
  addFinalizer,
  containsFinalizer,
  removeFinalizer
};
