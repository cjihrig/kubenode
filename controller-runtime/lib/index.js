'use strict';
const k8s = require('@kubernetes/client-node');
const { Builder } = require('./builder');
const { Manager } = require('./manager');
const {
  Reconciler,
  Request,
  Result,
  TerminalError
} = require('./reconcile');
const { Source } = require('./source');
const newControllerManagedBy = Builder.controllerManagedBy;
let lazyWebhook;

module.exports = {
  k8s,
  Manager,
  newControllerManagedBy,
  Reconciler,
  Request,
  Result,
  Source,
  TerminalError
};

Object.defineProperty(module.exports, 'webhook', {
  configurable: true,
  enumerable: true,
  get() {
    if (lazyWebhook === undefined) {
      const { Server } = require('./webhook/server');
      const admission = require('./webhook/admission');

      lazyWebhook = { admission, Server };
    }

    return lazyWebhook;
  }
});
