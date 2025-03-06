/**
 * @typedef {import('./context.js').Context} Context
 * @typedef {import('./reconcile.js').Request} Request
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
     * @param {ControllerOptions} [options] - Configuration options.
     */
    constructor(name: string, options?: ControllerOptions);
    /**
     * The controller name.
     * @type {string}
     */
    get name(): string;
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
     * A boolean indicating if the controller was started.
     * @type {boolean}
     */
    get started(): boolean;
    /**
     * stop() causes the controller to stop consuming events. If the controller
     * was already stopped, this is a no-op.
     * @returns {Promise<void>}
     */
    stop(): Promise<void>;
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
export type Request = import("./reconcile.js").Request;
export type Source = import("./source.js").Source;
export type ControllerOptions = {
    /**
     * The reconciler for the controller.
     */
    reconciler: Reconciler;
};
import { Result } from './reconcile.js';
import { Reconciler } from './reconcile.js';
