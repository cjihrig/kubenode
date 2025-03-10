/**
 * Manager runs controllers, webhooks, and other common dependencies.
 */
export class Manager {
    /**
     * Construct a Manager.
     * @param {ManagerOptions} [options] - Configuration options.
     */
    constructor(options?: ManagerOptions);
    client: KubernetesObjectApi;
    kubeconfig: KubeConfig;
    /**
     * add() causes the Manager to manage the provided controller.
     * @param {Controller} controller The controller to manage.
     */
    add(controller: Controller): void;
    /**
     * getWebhookServer() returns the Manager's webhook server.
     * @returns {Server}
     */
    getWebhookServer(): Server;
    /**
     * start() starts the webhook server and all managed controllers.
     * @param {Context} context The context to use.
     * @returns {Promise<void>}
     */
    start(context?: Context): Promise<void>;
    /**
     * A boolean indicating if the manager was started.
     * @type {boolean}
     */
    get started(): boolean;
    /**
     * stop() causes the manager to stop all resources that it manages. If the
     * manager was already stopped, this is a no-op.
     * @returns {Promise<void>}
     */
    stop(): Promise<void>;
    #private;
}
declare namespace _default {
    export { Manager };
}
export default _default;
export type Controller = import("./controller.js").Controller;
export type PromiseWithResolvers = import("./util.js").PromiseWithResolvers;
export type ManagerOptions = {
    /**
     * - Kubeconfig to use.
     */
    kubeconfig?: KubeConfig;
    /**
     * - Coordination v1 API to use.
     */
    coordinationClient?: CoordinationV1Api;
    /**
     * - Core v1 API to use.
     */
    coreClient?: CoreV1Api;
    /**
     * - Kubernetes client to use.
     */
    client?: KubernetesObjectApi;
    /**
     * - Whether or not to use leader election
     * when starting the manager.
     */
    leaderElection?: boolean;
    /**
     * - The name of the resource that
     * leader election will use for holding the leader lock.
     */
    leaderElectionName?: string;
    /**
     * - The namespace in which the
     * leader election resource will be created.
     */
    leaderElectionNamespace?: string;
    /**
     * - The duration that non-leader candidates
     * will wait to force acquire leadership. This is measured against time of last
     * observed ack. Default is 15 seconds.
     */
    leaseDuration?: number;
    /**
     * - The duration that the acting leader
     * will retry refreshing leadership before giving up. Default is ten seconds.
     */
    renewDeadline?: number;
    /**
     * - The duration the LeaderElector clients
     * should wait between tries of actions. Default is two seconds.
     */
    retryPeriod?: number;
};
import { KubernetesObjectApi } from '@kubernetes/client-node';
import { KubeConfig } from '@kubernetes/client-node';
import { Server } from './webhook/server.js';
import { Context } from './context.js';
import { CoordinationV1Api } from '@kubernetes/client-node';
import { CoreV1Api } from '@kubernetes/client-node';
