'use strict';
const { NamespacedName } = require('./apimachinery/types');

class Request extends NamespacedName {}

class Result {
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

class TerminalError extends Error {
  constructor(cause) {
    super('terminal error', { cause });
  }
}

class Reconciler {
  // eslint-disable-next-line class-methods-use-this, require-await
  async reconcile(context, request) {
    throw new Error('unimplemented reconcile()', { cause: request });
  }
}

module.exports = {
  Reconciler,
  Request,
  Result,
  TerminalError
};
