import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import {
  CoordinationV1Api,
  CoreV1Api,
  KubeConfig,
  KubernetesObjectApi,
} from '@kubernetes/client-node';
import { Context } from './context.js';
import { LeaderElector } from './leaderelection/leaderelection.js';
import { LeaseLock } from './leaderelection/leaselock.js';
import { EventRecorder } from './record/recorder.js';
import { Server } from './webhook/server.js';

/**
 * @typedef {import('./controller.js').Controller} Controller
 *
 * @typedef {Object} ManagerOptions
 * @property {KubeConfig} [kubeconfig] - Kubeconfig to use.
 * @property {CoordinationV1Api} [coordinationClient] - Coordination v1 API to use.
 * @property {CoreV1Api} [coreClient] - Core v1 API to use.
 * @property {KubernetesObjectApi} [client] - Kubernetes client to use.
 * @property {boolean} [leaderElection] - Whether or not to use leader election
 * when starting the manager.
 * @property {string} [leaderElectionName] - The name of the resource that
 * leader election will use for holding the leader lock.
 * @property {string} [leaderElectionNamespace] - The namespace in which the
 * leader election resource will be created.
 * @property {number} [leaseDuration] - The duration that non-leader candidates
 * will wait to force acquire leadership. This is measured against time of last
 * observed ack. Default is 15 seconds.
 * @property {number} [renewDeadline] - The duration that the acting leader
 * will retry refreshing leadership before giving up. Default is ten seconds.
 * @property {number} [retryPeriod] - The duration the LeaderElector clients
 * should wait between tries of actions. Default is two seconds.
 */

const kDefaultLeaseDuration = 15 * 1_000; // 15 seconds.
const kDefaultRenewDeadline = 10 * 1_000; // Ten seconds.
const kDefaultRetryPeriod = 2 * 1_000; // Two seconds.

/**
 * Manager runs controllers, webhooks, and other common dependencies.
 */
export class Manager {
  /** @type Controller[] */
  #controllers;
  /** @type LeaderElector */
  #leaderElector;
  /** @type Server */
  #webhookServer;

  /**
   * Construct a Manager.
   * @param {ManagerOptions} [options] - Configuration options.
   */
  constructor(options) {
    if (options === null || typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }

    let {
      client,
      coordinationClient,
      coreClient,
      kubeconfig,
      // TODO(cjihrig): Default this to true once the generated code is ready.
      leaderElection = false,
      leaderElectionName = '',
      leaderElectionNamespace = '',
      leaseDuration = kDefaultLeaseDuration,
      renewDeadline = kDefaultRenewDeadline,
      retryPeriod = kDefaultRetryPeriod,
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

    if (coordinationClient === undefined) {
      coordinationClient = kubeconfig.makeApiClient(CoordinationV1Api);
    } else if (!(coordinationClient instanceof CoordinationV1Api)) {
      throw new TypeError(
        'options.coordinationClient must be a CoordinationV1Api instance'
      );
    }

    if (coreClient === undefined) {
      coreClient = kubeconfig.makeApiClient(CoreV1Api);
    } else if (!(coreClient instanceof CoreV1Api)) {
      throw new TypeError('options.coreClient must be a CoreV1Api instance');
    }

    if (typeof leaderElection !== 'boolean') {
      throw new TypeError('options.leaderElection must be a boolean');
    }

    if (typeof leaderElectionName !== 'string') {
      throw new TypeError('options.leaderElectionName must be a string');
    }

    if (typeof leaderElectionNamespace !== 'string') {
      throw new TypeError('options.leaderElectionNamespace must be a string');
    }

    if (typeof leaseDuration !== 'number') {
      throw new TypeError('options.leaseDuration must be a number');
    }

    if (typeof renewDeadline !== 'number') {
      throw new TypeError('options.renewDeadline must be a number');
    }

    if (typeof retryPeriod !== 'number') {
      throw new TypeError('options.retryPeriod must be a number');
    }

    if (leaderElection) {
      const meta = {
        name: leaderElectionName,
        namespace: leaderElectionNamespace
      };
      const host = hostname();
      const id = `${host}_${randomUUID()}`;
      const eventSource = {
        host,
        component: 'manager',
      };
      const lockConfig = {
        identity: id,
        eventRecorder: new EventRecorder(eventSource, coreClient),
      };
      const electorOptions = {
        name: leaderElectionName,
        lock: new LeaseLock(meta, coordinationClient, lockConfig),
        leaseDuration,
        renewDeadline,
        retryPeriod,
        callbacks: {
          onNewLeader() {
          },
          onStartedLeading(ctx) {
            this.#startControllers(ctx);
          },
          onStoppedLeading() {

          },
        },
      };
      this.#leaderElector = new LeaderElector(electorOptions);
    } else {
      this.#leaderElector = null;
    }

    this.client = client;
    this.#controllers = [];
    this.kubeconfig = kubeconfig;
    this.started = false;
    this.#webhookServer = null;
  }

  /**
   * add() causes the Manager to manage the provided controller.
   * @param {Controller} controller The controller to manage.
   */
  add(controller) {
    this.#controllers.push(controller);
  }

  /**
   * getWebhookServer() returns the Manager's webhook server.
   * @returns {Server}
   */
  getWebhookServer() {
    if (this.#webhookServer === null) {
      this.#webhookServer = new Server();
    }

    return this.#webhookServer;
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

    // Webhooks can start before leader election.
    if (this.#webhookServer !== null) {
      await this.#webhookServer.start(context.child());
    }

    if (this.#leaderElector !== null) {
      this.#leaderElector.run(context.child());
    } else {
      this.#startControllers(context);
    }
  }

  /**
   * startControllers() starts all managed controllers. This should not be
   * called until the manager becomes the leader.
   * @param {Context} ctx The context to use.
   */
  #startControllers(ctx) {
    for (let i = 0; i < this.#controllers.length; ++i) {
      this.#controllers[i].start(ctx.child());
    }
  }
}

export default { Manager };
