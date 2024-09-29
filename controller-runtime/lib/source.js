'use strict';
const k8s = require('@kubernetes/client-node');
const { Request } = require('./reconcile');

class Source {
  constructor(kubeconfig, client, kind, apiVersion = 'v1') {
    if (!(kubeconfig instanceof k8s.KubeConfig)) {
      throw new TypeError('kubeconfig must be a KubeConfig instance');
    }

    if (!(client instanceof k8s.KubernetesObjectApi)) {
      throw new TypeError('client must be a KubernetesObjectApi instance');
    }

    if (typeof kind !== 'string') {
      throw new TypeError('kind must be a string');
    }

    if (typeof apiVersion !== 'string') {
      throw new TypeError('apiVersion must be a string');
    }

    this.kubeconfig = kubeconfig;
    this.client = client;
    this.kind = kind;
    this.apiVersion = apiVersion;
    this.informer = null;
  }

  async start(context, queue) {
    let apiVersion = this.apiVersion;

    if (apiVersion !== 'v1' && apiVersion.split('/').length === 1) {
      const res = await this.client.getAPIVersions();
      const api = res?.body?.groups?.find((group) => {
        return group.name === apiVersion;
      });

      if (api === undefined) {
        throw new Error(`unknown API '${apiVersion}'`);
      }

      apiVersion = `${apiVersion}/${api.preferredVersion.version}`;
    }

    // @ts-ignore
    const resource = await this.client.resource(apiVersion, this.kind);

    if (resource === undefined) {
      throw new Error(`unknown kind '${this.kind}' in API '${apiVersion}'`);
    }

    let informerPath;

    if (apiVersion.includes('/')) {
      informerPath = `/apis/${apiVersion}/${resource.name}`;
    } else {
      informerPath = `/api/${apiVersion}/${resource.name}`;
    }

    this.informer = k8s.makeInformer(this.kubeconfig, informerPath, () => {
      return this.client.list(apiVersion, this.kind);
    });

    this.informer.on('error', (err) => {
      if (err?.code !== 'ECONNRESET') {
        throw err;
      }

      setImmediate(() => {
        this.informer.start();
      });
    });

    this.informer.on('add', (resource) => {
      queue.enqueue(k8sObjectToRequest(resource));
    });

    this.informer.on('update', (resource) => {
      queue.enqueue(k8sObjectToRequest(resource));
    });

    this.informer.on('delete', (resource) => {
      queue.enqueue(k8sObjectToRequest(resource));
    });

    return this.informer.start();
  }
}

function k8sObjectToRequest(obj) {
  const { name, namespace } = obj.metadata;

  return new Request(name, namespace);
}

module.exports = { Source };
