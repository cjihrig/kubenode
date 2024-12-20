import * as k8s from '@kubernetes/client-node';
import errors from './apimachinery/errors.js';
import metav1 from './apimachinery/meta/v1.js';
import types from './apimachinery/types.js';
import { Builder } from './builder.js';
import controllerutil from './controllerutil.js';
import { Manager } from './manager.js';
import {
  Reconciler,
  Request,
  Result,
  TerminalError
} from './reconcile.js';
import admission from './webhook/admission.js';
import { Server } from './webhook/server.js';
import { Source } from './source.js';

const newControllerManagedBy = Builder.controllerManagedBy;
const apimachinery = {
  errors,
  meta: {
    v1: metav1
  },
  types
};
const webhook = {
  admission,
  Server
};

export {
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

export default {
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
