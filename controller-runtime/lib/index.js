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
