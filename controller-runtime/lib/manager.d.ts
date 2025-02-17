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
    constructor(options?: ManagerOptions);
    client: KubernetesObjectApi;
    /** @type Controller[] */
    controllers: Controller[];
    kubeconfig: KubeConfig;
    started: boolean;
    webhookServer: Server;
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
}
declare namespace _default {
    export { Manager };
}
export default _default;
export type Controller = import("./controller.js").Controller;
export type ManagerOptions = {
    /**
     * - Kubeconfig to use.
     */
    kubeconfig?: KubeConfig;
    /**
     * - Kubernetes client to use.
     */
    client?: KubernetesObjectApi;
};
import { KubernetesObjectApi } from '@kubernetes/client-node';
import { KubeConfig } from '@kubernetes/client-node';
import { Server } from './webhook/server.js';
import { Context } from './context.js';
