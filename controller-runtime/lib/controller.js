import { randomUUID } from 'node:crypto';
import { Result, TerminalError } from './reconcile.js';
import { Queue } from './queue.js';

export class Controller {
  constructor(name, manager, options = {}) {
    const {
      reconciler = null
    } = options;

    this.context = null;
    this.name = name;
    this.queue = new Queue();
    this.reconciler = reconciler;
    this.started = false;
    this.startWatches = [];
    manager.add(this);
  }

  reconcile(context, request) {
    return this.reconciler.reconcile(context, request);
  }

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

  watch(source) {
    if (!this.started) {
      this.startWatches.push(source);
      return;
    }

    source.start(this.context, this.queue);
  }

  async #reconcileHandler(context, request) {
    const ctx = { ...context, reconcileID: randomUUID() };
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
