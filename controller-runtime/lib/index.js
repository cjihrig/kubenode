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
const { Server } = require('./webhook/server');
const { Source } = require('./source');
const newControllerManagedBy = Builder.controllerManagedBy;

module.exports = {
  k8s,
  apimachinery: {
    errors: require('./apimachinery/errors'),
    meta: {
      v1: require('./apimachinery/meta/v1')
    },
    types: require('./apimachinery/types')
  },
  controllerutil: require('./controllerutil'),
  Manager,
  newControllerManagedBy,
  Reconciler,
  Request,
  Result,
  Source,
  TerminalError,
  webhook: {
    admission: require('./webhook/admission'),
    Server
  }
};
