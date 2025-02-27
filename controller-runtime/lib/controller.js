import { randomUUID } from 'node:crypto';
import { ReconcileContext } from './context.js';
import { Result, TerminalError } from './reconcile.js';
import { Queue } from './queue.js';

/**
 * @typedef {import('./context.js').Context} Context
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
   * @param {ControllerOptions} [options] - Configuration options.
   */
  constructor(name, options) {
    const {
      reconciler = null
    } = options;

    this.context = null;
    this.name = name;
    this.queue = new Queue();
    this.reconciler = reconciler;
    this.started = false;
    /** @type Source[] */
    this.startWatches = [];
  }

  /**
   * reconcile() invokes the controller's reconciler for a specific resource.
   * @param {Context} context - Context to use.
   * @param {Request} request - Resource information to reconcile.
   * @returns {Promise<Result>}
   */
  reconcile(context, request) {
    return this.reconciler.reconcile(context, request);
  }

  /**
   * start() begins consuming events.
   * @param {Context} context - Context to use.
   */
  start(context) {
    if (this.started) {
      throw new Error('controller already started');
    }

    this.started = true;
    this.context = context;
    this.queue.on('data', () => {
      const data = this.queue.dequeue();

      if (data === undefined) {
        return;
      }

      this.#reconcileHandler(context, data.data);
    });

    for (let i = 0; i < this.startWatches.length; ++i) {
      const source = this.startWatches[i];
      // TODO(cjihrig): Probably need to implement
      // Source.prototype.waitForSync() and call that here instead.
      source.start(this.context, this.queue);
    }

    this.startWatches = [];
  }

  /**
   * watch() begins watching a Source for events.
   * @param {Source} source - Source to watch for events.
   */
  watch(source) {
    if (!this.started) {
      this.startWatches.push(source);
      return;
    }

    source.start(this.context, this.queue);
  }

  /**
   * reconcileHandler() is an internal method that invokes the reconciler, and
   * processes the result, including requeuing logic.
   * @param {Context} context - Context to use.
   * @param {Request} request - Resource information to reconcile.
   * @returns {Promise<void>}
   */
  async #reconcileHandler(context, request) {
    const ctx = ReconcileContext.fromContext(
      // TODO(cjihrig): Provide a client as the third argument here.
      context.child(), randomUUID(), null
    );
    let result;

    try {
      result = await this.reconcile(ctx, request);

      if (!(result instanceof Result)) {
        result = new Result(result);
      }

      if (result.requeueAfter > 0) {
        setTimeout(() => {
          this.queue.enqueue(request);
        }, result.requeueAfter);
      } else if (result.requeue) {
        this.queue.enqueue(request);
      }
    } catch (err) {
      if (!(err instanceof TerminalError)) {
        this.queue.enqueue(request);
      }
    }
  }
}

export default { Controller };
