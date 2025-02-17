/**
 * @typedef {import('./context.js').Context} Context
 */
/**
 * Request contains the information necessary to reconcile a Kubernetes object.
 * This includes the information to uniquely identify the object. It does not
 * contain information about any specific Event or the object contents itself.
 */
export class Request extends NamespacedName {
}
/**
 * Result contains the result of a Reconciler invocation.
 */
export class Result {
    /**
     * Construct a Result.
     * @param {any} requeue - Whether or not to requeue a reconciliation.
     */
    constructor(requeue: any);
    requeue: boolean;
    requeueAfter: number;
}
/**
 * TerminalError is an error that will not be retried.
 */
export class TerminalError extends Error {
    /**
     * Construct a TerminalError.
     * @param {any} cause - The underlying cause of the TerminalError.
     */
    constructor(cause: any);
}
/**
 * Reconciler provides an interface for implementing reconciliation.
 */
export class Reconciler {
    /**
     * reconcile() implementations compare the desired state of an object as
     * specified by the user against the actual cluster state, and then performs
     * operations to make the actual cluster state reflect the desired state.
     * @param {Context} context - The context of the reconciliation.
     * @param {Request} request - The requested resource information.
     */
    reconcile(context: Context, request: Request): Promise<void>;
}
declare namespace _default {
    export { Reconciler };
    export { Request };
    export { Result };
    export { TerminalError };
}
export default _default;
export type Context = import("./context.js").Context;
import { NamespacedName } from './apimachinery/types.js';
