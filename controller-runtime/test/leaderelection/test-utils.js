import { LeaseLock } from '../../lib/leaderelection/leaselock.js';

export function createNotFoundError() {
  const err = new Error('mock not found');
  err.body = { code: 404 };
  return err;
}

export function getClient(mock) {
  const store = new Map();

  return {
    store,
    createNamespacedLease: mock.fn((o) => {
      const key = `${o.body.metadata.namespace}/${o.body.metadata.name}`;
      const val = o.body;

      store.set(key, val);
      return val;
    }),
    readNamespacedLease: mock.fn((o) => {
      const key = `${o.namespace}/${o.name}`;
      const val = store.get(key);

      if (val === undefined) {
        const err = createNotFoundError();
        throw err;
      }

      return val;
    }),
    replaceNamespacedLease: mock.fn((o) => {
      const key = `${o.body.metadata.namespace}/${o.body.metadata.name}`;
      const val = o.body;

      store.set(key, val);
      return val;
    }),
  };
}

export function getLease() {
  // V1MicroTime extends from JS Date.
  const acquireTime = new Date();
  const renewTime = new Date(acquireTime.getTime() + (2 * 60_000));

  return {
    apiVersion: 'coordination.k8s.io/v1',
    kind: 'Lease',
    metadata: {
      name: 'test-name',
      namespace: 'test-ns',
    },
    spec: {
      holderIdentity: 'bar',
      leaseDurationSeconds: 13,
      acquireTime,
      renewTime,
      leaseTransitions: 99,
    }
  };
}

export function getLeaseLock(mock) {
  const meta = getMetaObject();
  const client = getClient(mock);
  const lockConfig = getLockConfig(mock);

  return new LeaseLock(meta, client, lockConfig);
}

export function getLockConfig(mock) {
  return {
    identity: 'test-id',
    eventRecorder: {
      event: mock.fn(),
    }
  };
}

export function getMetaObject() {
  return { name: 'test-name', namespace: 'test-ns' };
}

export function getRecord() {
  // V1MicroTime extends from JS Date.
  const acquireTime = new Date();
  const renewTime = new Date(acquireTime.getTime() + (2 * 60_000));

  return {
    holderIdentity: 'foo',
    leaseDurationSeconds: 15,
    acquireTime,
    renewTime,
    leaderTransitions: 100,
    strategy: undefined,
    preferredHolder: undefined,
  };
}

export default {
  createNotFoundError,
  getClient,
  getLease,
  getLeaseLock,
  getLockConfig,
  getMetaObject,
  getRecord,
}
