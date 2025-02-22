/**
 * Context carries deadlines, cancellation signals, and other values across API
 * boundaries.
 */
export class Context {
    /**
     * Context.create() creates a new context object.
     * @returns {Context}
     */
    static create(): Context;
    /**
     * Construct a Context.
     */
    constructor(key: any, parent: any);
    /**
     * cancel() aborts the context.
     */
    cancel(): void;
    /**
     * child() derives a child context from the current context.
     * @returns {Context}
     */
    child(): Context;
    /**
     * A Promise that is settled based on the state of the context.
     * @type {Promise}
     */
    get done(): Promise<any>;
    /**
     * An AbortSignal that aborts when the context is cancelled.
     * @type {AbortSignal}
     */
    get signal(): AbortSignal;
    /**
     * A Map of arbitrary user data stored on the context.
     * @type {Map}
     */
    get values(): Map<any, any>;
    #private;
}
/**
 * ReconcileContext extends Context to provide additional data that is useful
 * during reconciliation.
 */
export class ReconcileContext extends Context {
    /**
     * ReconcileContext.fromContext() creates a new ReconcileContext object.
     * @param {Context} context - Parent context.
     * @param {string} reconcileID - Unique ID for the reconciliation.
     * @param {KubernetesObjectApi} client - Kubernetes client.
     * @returns {ReconcileContext}
     */
    static fromContext(context: Context, reconcileID: string, client: KubernetesObjectApi): ReconcileContext;
    /**
     * Construct a ReconcileContext.
     */
    constructor(key: any, parent: any, reconcileID: any, client: any);
    /** @type string */
    reconcileID: string;
    /** @type KubernetesObjectApi */
    client: KubernetesObjectApi;
    /**
     * child() derives a child ReconcileContext from the current ReconcileContext.
     * @returns {ReconcileContext}
     */
    child(): ReconcileContext;
}
declare namespace _default {
    export { Context };
    export { ReconcileContext };
}
export default _default;
export type KubernetesObjectApi = import("@kubernetes/client-node").KubernetesObjectApi;
export type PromiseWithResolvers = import("./util.js").PromiseWithResolvers;
