import { randomUUID } from 'node:crypto';
import { ReconcileContext } from './context.js';
import { Reconciler, Result, TerminalError } from './reconcile.js';
import { Queue } from './queue.js';

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
  /** @type Context */
  #context;
  /** @type string */
  #name;
  /** @type Queue<Request> */
  #queue;
  /** @type Reconciler */
  #reconciler;
  /** @type Source[] */
  #sources;
  /** @type boolean */
  #started;
  /** @type Source[] */
  #startWatches;

  /**
   * Construct a Controller.
   * @param {string} name - Controller name.
   * @param {ControllerOptions} [options] - Configuration options.
   */
  constructor(name, options) {
    if (typeof name !== 'string') {
      throw new TypeError('name must be a string');
    }

    if (options === null || typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }

    const {
      reconciler
    } = options;

    if (!(reconciler instanceof Reconciler)) {
      throw new TypeError('options.reconciler must be a Reconciler instance');
    }

    this.#context = null;
    this.#name = name;
    this.#queue = new Queue();
    this.#reconciler = reconciler;
    this.#sources = [];
    this.#started = false;
    this.#startWatches = [];
  }

  /**
   * The controller name.
   * @type {string}
   */
  get name() {
    return this.#name;
  }

  /**
   * reconcile() invokes the controller's reconciler for a specific resource.
   * @param {Context} context - Context to use.
   * @param {Request} request - Resource information to reconcile.
   * @returns {Promise<Result>}
   */
  reconcile(context, request) {
    const ctx = ReconcileContext.fromContext(context, randomUUID());

    return this.#reconciler.reconcile(ctx, request);
  }

  /**
   * start() begins consuming events.
   * @param {Context} context - Context to use.
   */
  start(context) {
    if (this.#started) {
      throw new Error('controller already started');
    }

    this.#started = true;
    this.#context = context;
    this.#queue.on('data', () => {
      const data = this.#queue.dequeue();

      if (data === undefined) {
        return;
      }

      this.#reconcileHandler(context, data.data);
    });

    context.signal.addEventListener('abort', () => {
      this.stop();
    });

    for (let i = 0; i < this.#startWatches.length; ++i) {
      const source = this.#startWatches[i];
      // TODO(cjihrig): Probably need to implement
      // Source.prototype.waitForSync() and call that here instead.
      this.#sources.push(source);
      source.start(this.#context.child(), this.#queue);
    }

    this.#startWatches = [];
  }

  /**
   * A boolean indicating if the controller was started.
   * @type {boolean}
   */
  get started() {
    return this.#started;
  }

  /**
   * stop() causes the controller to stop consuming events. If the controller
   * was already stopped, this is a no-op.
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this.#started) {
      return;
    }

    const promises = this.#sources.map((source) => {
      return source.stop();
    });

    await Promise.allSettled(promises);
    this.#started = false;
  }

  /**
   * watch() begins watching a Source for events.
   * @param {Source} source - Source to watch for events.
   */
  watch(source) {
    if (!this.#started) {
      this.#startWatches.push(source);
      return;
    }

    this.#sources.push(source);
    source.start(this.#context.child(), this.#queue);
  }

  /**
   * reconcileHandler() is an internal method that invokes the reconciler, and
   * processes the result, including requeuing logic.
   * @param {Context} context - Context to use.
   * @param {Request} request - Resource information to reconcile.
   * @returns {Promise<void>}
   */
  async #reconcileHandler(context, request) {
    let result;

    try {
      result = await this.reconcile(context, request);

      if (!(result instanceof Result)) {
        result = new Result(result);
      }

      if (result.requeueAfter > 0) {
        setTimeout(() => {
          this.#queue.enqueue(request);
        }, result.requeueAfter);
      } else if (result.requeue) {
        this.#queue.enqueue(request);
      }
    } catch (err) {
      if (!(err instanceof TerminalError)) {
        this.#queue.enqueue(request);
      }
    }
  }
}

export default { Controller };
