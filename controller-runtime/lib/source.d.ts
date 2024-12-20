export class Source {
    constructor(kubeconfig: any, client: any, kind: any, apiVersion?: string);
    kubeconfig: k8s.KubeConfig;
    client: k8s.KubernetesObjectApi;
    kind: string;
    apiVersion: string;
    informer: k8s.Informer<k8s.KubernetesObject>;
    start(context: any, queue: any): Promise<void>;
}
declare namespace _default {
    export { Source };
}
export default _default;
import * as k8s from '@kubernetes/client-node';
