import {
  KubeConfig,
  KubernetesObjectApi,
} from '@kubernetes/client-node';
import { Context } from './context.js';
import { Server } from './webhook/server.js';

/**
 * @typedef {import('./controller.js').Controller} Controller
 *
 * @typedef {Object} ManagerOptions
 * @property {KubeConfig} [kubeconfig] - Kubeconfig to use.
 * @property {KubernetesObjectApi} [client] - Kubernetes client to use.
 */

/**
 * Manager runs controllers, webhooks, and other common dependencies.
 */
export class Manager {
  /**
   * Construct a Manager.
   * @param {ManagerOptions} [options] - Configuration options.
   */
  constructor(options) {
    if (options === undefined) {
      options = {};
    } else if (options === null || typeof options !== 'object') {
      throw new Error('options must be an object');
    }

    let {
      client,
      kubeconfig
    } = options;

    if (kubeconfig === undefined) {
      kubeconfig = new KubeConfig();
      kubeconfig.loadFromDefault();
    } else if (!(kubeconfig instanceof KubeConfig)) {
      throw new TypeError('options.kubeconfig must be a KubeConfig instance');
    }

    if (client === undefined) {
      client = KubernetesObjectApi.makeApiClient(kubeconfig);
    } else if (!(client instanceof KubernetesObjectApi)) {
      throw new TypeError(
        'options.client must be a KubernetesObjectApi instance'
      );
    }

    this.client = client;
    /** @type Controller[] */
    this.controllers = [];
    this.kubeconfig = kubeconfig;
    this.started = false;
    this.webhookServer = null;
  }

  /**
   * add() causes the Manager to manage the provided controller.
   * @param {Controller} controller The controller to manage.
   */
  add(controller) {
    this.controllers.push(controller);
  }

  /**
   * getWebhookServer() returns the Manager's webhook server.
   * @returns {Server}
   */
  getWebhookServer() {
    if (this.webhookServer === null) {
      this.webhookServer = new Server();
    }

    return this.webhookServer;
  }

  /**
   * start() starts the webhook server and all managed controllers.
   * @param {Context} context The context to use.
   * @returns {Promise<void>}
   */
  async start(context = Context.create()) {
    if (this.started) {
      throw new Error('manager already started');
    }

    this.started = true;

    if (this.webhookServer !== null) {
      await this.webhookServer.start(context);
    }

    for (let i = 0; i < this.controllers.length; ++i) {
      this.controllers[i].start(context);
    }
  }
}

export default { Manager };
