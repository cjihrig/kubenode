/**
 * addFinalizer() adds a finalizer to a Kubernetes object. If the finalizer
 * already existed on the object, it is not added again. Returns a boolean
 * indicating if the finalizer was added.
 * @param {KubernetesObject} o - Kubernetes object to add the finalizer to.
 * @param {string} finalizer - Finalizer to add.
 * @returns {boolean}
 */
export function addFinalizer(o: KubernetesObject, finalizer: string): boolean;
/**
 * containsFinalizer() returns a boolean indicating if the object contains the
 * specified finalizer.
 * @param {KubernetesObject} o - Kubernetes object to check.
 * @param {string} finalizer - Finalizer to check.
 * @returns {boolean}
 */
export function containsFinalizer(o: KubernetesObject, finalizer: string): boolean;
/**
 * removeFinalizer() removes the specified finalizer from the object if it is
 * present. A boolean is returned indicated if the finalizer was removed.
 * @param {KubernetesObject} o - Kubernetes object to remove the finalizer from.
 * @param {string} finalizer - Finalizer to remove.
 * @returns {boolean}
 */
export function removeFinalizer(o: KubernetesObject, finalizer: string): boolean;
/**
 * hasOwnerReference() returns true if the owners list contains an owner
 * reference that matches the object's group, kind, and name.
 * @param {V1OwnerReference[]} ownerRefs - List of owner references to check.
 * @param {KubernetesObject} o - Kubernetes object to get GVK from.
 * @returns {boolean}
 */
export function hasOwnerReference(ownerRefs: V1OwnerReference[], o: KubernetesObject): boolean;
/**
 * setOwnerReference() ensures the given object contains an owner reference to
 * the provided owner object. If a reference to the same owner already exists,
 * it is overwritten.
 * @param {KubernetesObject} owner - Kubernetes object used as owner.
 * @param {KubernetesObject} object - Kubernetes object that is owned.
 */
export function setOwnerReference(owner: KubernetesObject, object: KubernetesObject): void;
/**
 * removeOwnerReference() removes an owner reference from object. If no such
 * owner reference exists, an exception is thrown.
 * @param {KubernetesObject} owner - Kubernetes object used as owner.
 * @param {KubernetesObject} object - Kubernetes object that is owned.
 */
export function removeOwnerReference(owner: KubernetesObject, object: KubernetesObject): void;
/**
 * hasControllerReference() returns true if the object has an owner reference
 * with the controller property set to true.
 * @param {KubernetesObject} o - Kubernetes object to check.
 * @returns {boolean}
 */
export function hasControllerReference(o: KubernetesObject): boolean;
/**
 * setControllerReference() sets owner as a Controller OwnerReference on object.
 * @param {KubernetesObject} owner - Kubernetes object used as owner.
 * @param {KubernetesObject} object - Kubernetes object that is owned.
 */
export function setControllerReference(owner: KubernetesObject, object: KubernetesObject): void;
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
    constructor(object: KubernetesObject, owner: V1OwnerReference);
    object: import("@kubernetes/client-node").KubernetesObject;
    owner: import("@kubernetes/client-node").V1OwnerReference;
}
declare namespace _default {
    export { AlreadyOwnedError };
    export { addFinalizer };
    export { containsFinalizer };
    export { hasControllerReference };
    export { hasOwnerReference };
    export { removeFinalizer };
    export { removeOwnerReference };
    export { setControllerReference };
    export { setOwnerReference };
}
export default _default;
export type KubernetesObject = import("@kubernetes/client-node").KubernetesObject;
export type V1OwnerReference = import("@kubernetes/client-node").V1OwnerReference;
