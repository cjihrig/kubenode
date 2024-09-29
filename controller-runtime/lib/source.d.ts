export class Source {
    constructor(kubeconfig: any, client: any, kind: any, apiVersion?: string);
    kubeconfig: k8s.KubeConfig;
    client: k8s.KubernetesObjectApi;
    kind: string;
    apiVersion: string;
    informer: k8s.Informer<k8s.KubernetesObject> & k8s.ObjectCache<k8s.KubernetesObject>;
    start(context: any, queue: any): Promise<void>;
}
import k8s = require("@kubernetes/client-node");
