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
declare namespace _default {
    export { Context };
}
export default _default;
export type PromiseWithResolvers = {
    promise: Promise<any>;
    resolve: Function;
    reject: Function;
};
