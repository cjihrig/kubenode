/**
 * @typedef {import('@kubernetes/client-node').KubernetesObject} KubernetesObject
 * @typedef {import('./context.js').Context} Context
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
    constructor(kubeconfig: KubeConfig, client: KubernetesObjectApi, kind: string, apiVersion?: string);
    kubeconfig: KubeConfig;
    client: KubernetesObjectApi;
    kind: string;
    apiVersion: string;
    informer: import("@kubernetes/client-node").Informer<import("@kubernetes/client-node").KubernetesObject>;
    /**
     * start() causes the Source to start watching for and reporting events.
     * @param {Context} context - Context to use.
     * @param {Object} queue - Queue to insert observed events into.
     * @returns {Promise<void>}
     */
    start(context: Context, queue: any): Promise<void>;
}
declare namespace _default {
    export { Source };
}
export default _default;
export type KubernetesObject = import("@kubernetes/client-node").KubernetesObject;
export type Context = import("./context.js").Context;
import { KubeConfig } from '@kubernetes/client-node';
import { KubernetesObjectApi } from '@kubernetes/client-node';
