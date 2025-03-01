import {
  CoordinationV1Api,
  CoreV1Api,
  KubeConfig,
  KubernetesObjectApi
} from '@kubernetes/client-node';

export function getManagerOptions() {
  const kubeconfig = new KubeConfig();
  const kcOptions = {
    clusters: [{ name: 'cluster', server: 'https://127.0.0.1:51010' }],
    users: [{ name: 'user', password: 'password' }],
    contexts: [{ name: 'currentContext', cluster: 'cluster', user: 'user' }],
    currentContext: 'currentContext',
  };
  kubeconfig.loadFromOptions(kcOptions);

  return {
    kubeconfig,
    client: KubernetesObjectApi.makeApiClient(kubeconfig),
    coordinationClient: kubeconfig.makeApiClient(CoordinationV1Api),
    coreClient: kubeconfig.makeApiClient(CoreV1Api),
    leaderElection: true,
    leaderElectionName: 'test-lock',
    leaderElectionNamespace: 'test-ns',
    leaseDuration: 15_000,
    renewDeadline: 10_000,
    retryPeriod: 2_000,
  };
}

export default {
  getManagerOptions,
}
