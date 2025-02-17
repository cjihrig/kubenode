const kConstructorKey = Symbol('constructorKey');

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

    this.#signal.addEventListener('abort', () => {
      if (this.#settled) {
        return;
      }

      this.#settled = true;
      this.#promise.reject(this.#signal.reason);
    });
  }

  cancel() {
    this.#controller.abort();
  }

  child() {
    return new Context(kConstructorKey, this);
  }

  get done() {
    return this.#promise.promise;
  }

  get signal() {
    return this.#signal;
  }

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

  static create() {
    return new Context(kConstructorKey, null);
  }
}

/**
 * @typedef {Object} PromiseWithResolvers
 * @property {Promise} promise
 * @property {Function} resolve
 * @property {Function} reject
 */
function withResolvers() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export default {
  Context,
}
