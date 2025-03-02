import {
  KubeConfig,
  KubernetesObjectApi,
  makeInformer,
} from '@kubernetes/client-node';
import { Request } from './reconcile.js';

/**
 * @typedef {import('@kubernetes/client-node').KubernetesObject} KubernetesObject
 * @typedef {import('./context.js').Context} Context
 * @typedef {import('./queue.js').Queue<Request>} Queue<Request>
 */

/**
 * Source provides event streams to hook up to Controllers.
 */
export class Source {
  /**
   * Construct a Source.
   * @param {KubeConfig} kubeconfig - Kubeconfig to use.
   * @param {KubernetesObjectApi} client - Kubernetes client to use.
   * @param {string} kind - Resource kind to watch.
   * @param {string} [apiVersion] - API version of resource to watch.
   */
  constructor(kubeconfig, client, kind, apiVersion = 'v1') {
    if (!(kubeconfig instanceof KubeConfig)) {
      throw new TypeError('kubeconfig must be a KubeConfig instance');
    }

    if (!(client instanceof KubernetesObjectApi)) {
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

  /**
   * start() causes the Source to start watching for and reporting events.
   * @param {Context} context - Context to use.
   * @param {Queue} queue - Queue to insert observed events into.
   * @returns {Promise<void>}
   */
  async start(context, queue) {
    let apiVersion = this.apiVersion;

    if (apiVersion !== 'v1' && apiVersion.split('/').length === 1) {
      // @ts-ignore
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

    this.informer = makeInformer(this.kubeconfig, informerPath, () => {
      return this.client.list(apiVersion, this.kind);
    });

    this.informer.on('error', (err) => {
      // @ts-ignore
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

/**
 * k8sObjectToRequest() creates a Request based on a Kubernetes object.
 * @param {KubernetesObject} obj - Kubernetes object.
 * @returns {Request}
 */
function k8sObjectToRequest(obj) {
  const { name, namespace } = obj.metadata;

  return new Request(name, namespace);
}

export default { Source };
