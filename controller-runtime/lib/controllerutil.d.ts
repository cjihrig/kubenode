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
declare namespace _default {
    export { addFinalizer };
    export { containsFinalizer };
    export { removeFinalizer };
}
export default _default;
export type KubernetesObject = import("@kubernetes/client-node").KubernetesObject;
