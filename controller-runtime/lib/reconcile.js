import { NamespacedName } from './apimachinery/types.js';

export class Request extends NamespacedName {}

export class Result {
  constructor(requeue) {
    if (typeof requeue === 'number') {
      this.requeue = true;
      this.requeueAfter = requeue;
    } else {
      this.requeue = !!requeue;
      this.requeueAfter = 0;
    }
  }
}

export class TerminalError extends Error {
  constructor(cause) {
    super('terminal error', { cause });
  }
}

export class Reconciler {
  // eslint-disable-next-line class-methods-use-this, require-await
  async reconcile(context, request) {
    throw new Error('unimplemented reconcile()', { cause: request });
  }
}

export default {
  Reconciler,
  Request,
  Result,
  TerminalError
};
