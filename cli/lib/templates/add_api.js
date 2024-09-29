'use strict';

function controller(data) {
  return `import {
  newControllerManagedBy,
  Reconciler,
} from '@kubenode/controller-runtime';

// ATTENTION: YOU **SHOULD** EDIT THIS FILE!

export class ${data.kind}Reconciler extends Reconciler {
  async reconcile(ctx, req) {

  }

  setupWithManager(manager) {
    newControllerManagedBy(manager)
      .for('${data.kind}', '${data.group}/${data.version}')
      .complete(this);
  }
}
`;
}

function types(data) {
  return `/**
 * @kubenode
 * @apiVersion ${data.group}/${data.version}
 * @kind ${data.kind}
 * @scope namespaced
 * @plural ${data.plural}
 * @singular ${data.singular}
 * @description Schema for the ${data.plural} API
 */
type ${data.kind} = {
  /**
   * @description apiVersion defines the versioned schema of this representation
   * of an object. Servers should convert recognized schemas to the latest
   * internal value, and may reject unrecognized values.
   */
  apiVersion: string;

  /**
   * @description kind is a string value representing the REST resource this
   * object represents.
   */
  kind: string;

  /**
   * @description metadata is a standard Kubernetes object for metadata.
   */
  metadata: object;

  /**
   * @description spec defines the desired state of ${data.kind}.
   */
  spec: ${data.kind}Spec;

  /**
   * @description status defines the observed state of ${data.kind}.
   */
  status: ${data.kind}Status;
};

type ${data.kind}Spec = {
};

type ${data.kind}Status = {
};

type ${data.listKind} = {
  /**
   * @description apiVersion defines the versioned schema of this representation
   * of an object. Servers should convert recognized schemas to the latest
   * internal value, and may reject unrecognized values.
   */
  apiVersion: string;

  /**
   * @description kind is a string value representing the REST resource this
   * object represents.
   */
  kind: string;

  /**
   * @description metadata is a standard Kubernetes object for metadata.
   */
  metadata: object;

  /**
   * @description list contains the collection of ${data.kind} resources.
   */
  items: ${data.kind}[];
};
`;
}

module.exports = {
  controller,
  types
};
