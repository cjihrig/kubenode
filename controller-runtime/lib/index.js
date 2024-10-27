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
let lazyWebhookServer;
let lazyWebhookAdmission;

const webhook = {
  /**
   * @type {import("./webhook/server").Server}
   */
  get Server() {
    if (lazyWebhookServer === undefined) {
      const { Server } = require('./webhook/server');

      lazyWebhookServer = Server;
    }

    return lazyWebhookServer;
  },
  /**
   * @type {import("./webhook/admission")}
   */
  get admission() {
    if (lazyWebhookAdmission === undefined) {
      lazyWebhookAdmission = require('./webhook/admission');
    }

    return lazyWebhookAdmission;
  }
};

module.exports = {
  k8s,
  Manager,
  newControllerManagedBy,
  Reconciler,
  Request,
  Result,
  Source,
  TerminalError,
  webhook
};
