/**
 * @typedef {import('./context.js').Context} Context
 * @typedef {import('./manager.js').Manager} Manager
 * @typedef {import('./reconcile.js').Request} Request
 * @typedef {import('./reconcile.js').Reconciler} Reconciler
 * @typedef {import('./source.js').Source} Source
 *
 * @typedef {Object} ControllerOptions
 * @property {Reconciler} reconciler The reconciler for the controller.
 */
/**
 * Controllers use events to trigger reconcile requests.
 */
export class Controller {
    /**
     * Construct a Controller.
     * @param {string} name - Controller name.
     * @param {Manager} manager - The manager in charge of this controller.
     * @param {ControllerOptions} [options] - Configuration options.
     */
    constructor(name: string, manager: Manager, options?: ControllerOptions);
    context: import("./context.js").Context;
    name: string;
    queue: Queue;
    reconciler: import("./reconcile.js").Reconciler;
    started: boolean;
    /** @type Source[] */
    startWatches: Source[];
    /**
     * reconcile() invokes the controller's reconciler for a specific resource.
     * @param {Context} context - Context to use.
     * @param {Request} request - Resource information to reconcile.
     * @returns {Promise<Result>}
     */
    reconcile(context: Context, request: Request): Promise<Result>;
    /**
     * start() begins consuming events.
     * @param {Context} context - Context to use.
     */
    start(context: Context): void;
    /**
     * watch() begins watching a Source for events.
     * @param {Source} source - Source to watch for events.
     */
    watch(source: Source): void;
    #private;
}
declare namespace _default {
    export { Controller };
}
export default _default;
export type Context = import("./context.js").Context;
export type Manager = import("./manager.js").Manager;
export type Request = import("./reconcile.js").Request;
export type Reconciler = import("./reconcile.js").Reconciler;
export type Source = import("./source.js").Source;
export type ControllerOptions = {
    /**
     * The reconciler for the controller.
     */
    reconciler: Reconciler;
};
import { Queue } from './queue.js';
import { Result } from './reconcile.js';
