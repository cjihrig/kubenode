'use strict';
const k8s = require('@kubernetes/client-node');

class Manager {
  constructor(options = {}) {
    if (options === null || typeof options !== 'object') {
      throw new Error('options must be an object');
    }

    let {
      // @ts-ignore
      client,
      // @ts-ignore
      kubeconfig
    } = options;

    if (kubeconfig === undefined) {
      kubeconfig = new k8s.KubeConfig();
      kubeconfig.loadFromDefault();
    } else if (!(kubeconfig instanceof k8s.KubeConfig)) {
      throw new TypeError('options.kubeconfig must be a KubeConfig instance');
    }

    if (client === undefined) {
      client = k8s.KubernetesObjectApi.makeApiClient(kubeconfig);
    } else if (!(client instanceof k8s.KubernetesObjectApi)) {
      throw new TypeError(
        'options.client must be a KubernetesObjectApi instance'
      );
    }

    this.client = client;
    this.controllers = [];
    this.kubeconfig = kubeconfig;
    this.started = false;
    this.webhookServer = null;
  }

  add(controller) {
    this.controllers.push(controller);
  }

  getWebhookServer() {
    if (this.webhookServer === null) {
      const { Server } = require('./webhook/server');
      this.webhookServer = new Server();
    }

    return this.webhookServer;
  }

  start(context = this.#defaultContext()) {
    if (this.started) {
      throw new Error('manager already started');
    }

    this.started = true;
    for (let i = 0; i < this.controllers.length; ++i) {
      this.controllers[i].start(context);
    }
  }

  #defaultContext() {
    return { client: this.client };
  }
}

module.exports = { Manager };
