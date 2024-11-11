'use strict';
const k8s = require('@kubernetes/client-node');
const { Builder } = require('./builder');
const controllerutil = require('./controllerutil');
const { Manager } = require('./manager');
const {
  Reconciler,
  Request,
  Result,
  TerminalError
} = require('./reconcile');
const { Server } = require('./webhook/server');
const { Source } = require('./source');
const newControllerManagedBy = Builder.controllerManagedBy;
const apimachinery = {
  errors: require('./apimachinery/errors'),
  meta: {
    v1: require('./apimachinery/meta/v1')
  },
  types: require('./apimachinery/types')
};
const webhook = {
  admission: require('./webhook/admission'),
  Server
};

const defaultExport = {
  k8s,
  apimachinery,
  controllerutil,
  Manager,
  newControllerManagedBy,
  Reconciler,
  Request,
  Result,
  Source,
  TerminalError,
  webhook
};

module.exports = defaultExport;
module.exports.default = defaultExport;
module.exports.k8s = k8s;
module.exports.apimachinery = apimachinery;
module.exports.controllerutil = controllerutil;
module.exports.Manager = Manager;
module.exports.newControllerManagedBy = newControllerManagedBy;
module.exports.Reconciler = Reconciler;
module.exports.Request = Request;
module.exports.Result = Result;
module.exports.Source = Source;
module.exports.TerminalError = TerminalError;
module.exports.webhook = webhook;
