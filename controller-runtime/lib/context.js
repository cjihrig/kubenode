import { withResolvers } from './util.js';

/**
 * @typedef {import('./util.js').PromiseWithResolvers} PromiseWithResolvers
 */

const kConstructorKey = Symbol('constructorKey');
const noop = () => {};

/**
 * Context carries deadlines, cancellation signals, and other values across API
 * boundaries.
 */
export class Context {
  /** @type AbortController */
  #controller;
  /** @type Context|null */
  #parent;
  /** @type PromiseWithResolvers */
  #promise;
  /** @type boolean */
  #settled;
  /** @type AbortSignal */
  #signal;
  /** @type Map */
  #values;

  /**
   * Construct a Context.
   */
  constructor(key, parent) {
    if (key !== kConstructorKey) {
      throw new Error('illegal constructor');
    }

    this.#controller = new AbortController();
    this.#parent = parent;
    this.#promise = withResolvers();
    this.#settled = false;
    this.#values = null;

    if (parent === null) {
      this.#signal = this.#controller.signal;
    } else {
      this.#signal = AbortSignal.any([
        this.#controller.signal,
        this.#parent.#signal,
      ]);
    }

    // Prevent unhandledRejections on aborts.
    this.#promise.promise.catch(noop);

    this.#signal.addEventListener('abort', () => {
      if (this.#settled) {
        return;
      }

      this.#settled = true;
      this.#promise.reject(this.#signal.reason);
    });
  }

  /**
   * cancel() aborts the context.
   */
  cancel() {
    this.#controller.abort();
  }

  /**
   * child() derives a child context from the current context.
   * @returns {Context}
   */
  child() {
    return new Context(kConstructorKey, this);
  }

  /**
   * A Promise that is settled based on the state of the context.
   * @type {Promise}
   */
  get done() {
    return this.#promise.promise;
  }

  /**
   * An AbortSignal that aborts when the context is cancelled.
   * @type {AbortSignal}
   */
  get signal() {
    return this.#signal;
  }

  /**
   * A Map of arbitrary user data stored on the context.
   * @type {Map}
   */
  get values() {
    if (this.#values === null) {
      if (this.#parent === null) {
        this.#values = new Map();
      } else {
        this.#values = new Map(this.#parent.#values);
      }
    }

    return this.#values;
  }

  /**
   * Context.create() creates a new context object.
   * @returns {Context}
   */
  static create() {
    return new Context(kConstructorKey, null);
  }
}

/**
 * ReconcileContext extends Context to provide additional data that is useful
 * during reconciliation.
 */
export class ReconcileContext extends Context {
  /**
   * Construct a ReconcileContext.
   */
  constructor(key, parent, reconcileID) {
    super(key, parent);
    /** @type string */
    this.reconcileID = reconcileID;
  }

  /**
   * child() derives a child ReconcileContext from the current ReconcileContext.
   * @returns {ReconcileContext}
   */
  child() {
    return new ReconcileContext(kConstructorKey, this, this.reconcileID);
  }

  /**
   * ReconcileContext.fromContext() creates a new ReconcileContext object.
   * @param {Context} context - Parent context.
   * @param {string} reconcileID - Unique ID for the reconciliation.
   * @returns {ReconcileContext}
   */
  static fromContext(context, reconcileID) {
    if (!(context instanceof Context)) {
      throw new TypeError('context must be a Context instance');
    }

    if (typeof reconcileID !== 'string') {
      throw new TypeError('reconcileID must be a string');
    }

    return new ReconcileContext(kConstructorKey, context, reconcileID);
  }
}

export default {
  Context,
  ReconcileContext,
}
