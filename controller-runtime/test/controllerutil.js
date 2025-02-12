import assert from 'node:assert';
import { suite, test } from 'node:test';
import {
  AlreadyOwnedError,
  addFinalizer,
  hasControllerReference,
  containsFinalizer,
  removeFinalizer,
  setControllerReference,
} from '../lib/controllerutil.js';

function mockK8sObject() {
  return structuredClone({
    apiVersion: 'mock.kubenode.io/v1',
    kind: 'MockResource',
    metadata: {
      name: 'mock-resource-1',
      namespace: 'mock-namespace-1',
    }
  });
}

test('AlreadyOwnedError() constructor', () => {
  const obj = mockK8sObject();
  const own = { name: 'owner', kind: 'Mocker' };
  obj.metadata.name = 'obj';
  obj.metadata.namespace = 'x';
  const err = new AlreadyOwnedError(obj, own);
  assert.strictEqual(err instanceof Error, true);
  assert.strictEqual(err.object, obj);
  assert.strictEqual(err.owner, own);
  assert.strictEqual(
    err.message,
    'object \'x/obj\' is already owned by another Mocker controller \'owner\''
  );
});

suite('containsFinalizer()', () => {
  test('returns false if object does not have a finalizers array', () => {
    const obj = mockK8sObject();
    const finalizer = 'kubenode.io/test-finalizer';
    assert.strictEqual(obj.metadata.finalizers, undefined);
    assert.strictEqual(containsFinalizer(obj, finalizer), false);
  });

  test('returns false if object does not contain finalizer', () => {
    const obj = mockK8sObject();
    const finalizer = 'kubenode.io/test-finalizer';
    obj.metadata.finalizers = [finalizer];
    assert.strictEqual(containsFinalizer(obj, finalizer + '-x'), false);
  });

  test('returns true if object contains finalizer', () => {
    const obj = mockK8sObject();
    const finalizer = 'kubenode.io/test-finalizer';
    obj.metadata.finalizers = [finalizer];
    assert.strictEqual(containsFinalizer(obj, finalizer), true);
  });
});

suite('addFinalizer()', () => {
  test('return value indicates if the finalizer was added', () => {
    const obj = mockK8sObject();
    const finalizer = 'kubenode.io/test-finalizer';
    assert.strictEqual(containsFinalizer(obj, finalizer), false);
    assert.strictEqual(addFinalizer(obj, finalizer), true);
    assert.strictEqual(containsFinalizer(obj, finalizer), true);
    assert.strictEqual(addFinalizer(obj, finalizer), false);
    assert.strictEqual(containsFinalizer(obj, finalizer), true);
    assert.deepStrictEqual(obj.metadata.finalizers, [finalizer]);
  });
});

suite('removeFinalizer()', () => {
  test('returns false if object does not have a finalizers array', () => {
    const obj = mockK8sObject();
    const finalizer = 'kubenode.io/test-finalizer';
    assert.strictEqual(obj.metadata.finalizers, undefined);
    assert.strictEqual(removeFinalizer(obj, finalizer), false);
  });

  test('returns false if object does not contain finalizer', () => {
    const obj = mockK8sObject();
    const finalizer = 'kubenode.io/test-finalizer';
    obj.metadata.finalizers = [finalizer];
    assert.strictEqual(removeFinalizer(obj, finalizer + '-x'), false);
  });

  test('returns true if finalizer was removed', () => {
    const obj = mockK8sObject();
    const finalizer = 'kubenode.io/test-finalizer';
    obj.metadata.finalizers = [finalizer];
    assert.strictEqual(removeFinalizer(obj, finalizer), true);
    assert.deepStrictEqual(obj.metadata.finalizers, []);
  });
});

suite('hasControllerReference()', () => {
  test('returns false if object does not have an owners array', () => {
    const obj = mockK8sObject();
    assert.strictEqual(obj.metadata.ownerReferences, undefined);
    assert.strictEqual(hasControllerReference(obj), false);
  });

  test('returns false if object does not have a controller reference', () => {
    const obj = mockK8sObject();
    const owner = { controller: false };
    obj.metadata.ownerReferences = [owner];
    assert.strictEqual(hasControllerReference(obj), false);
  });

  test('returns true if object has a controller reference', () => {
    const obj = mockK8sObject();
    const owner = { controller: true };
    obj.metadata.ownerReferences = [owner];
    assert.strictEqual(hasControllerReference(obj), true);
  });
});

suite('setControllerReference()', () => {
  function getOwnerObject() {
    const own = mockK8sObject();
    own.apiVersion = 'owner.kubenode.io/v2';
    own.kind = 'OwnerResource';
    own.metadata.name = 'owner-resource';
    own.metadata.uid = 'deadbeef';
    return own;
  }

  test('successfully adds a controller reference', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();

    assert.strictEqual(hasControllerReference(obj), false);
    assert.deepStrictEqual(obj.metadata.ownerReferences, undefined);
    assert.strictEqual(setControllerReference(own, obj), undefined);
    assert.strictEqual(hasControllerReference(obj), true);
    assert.deepStrictEqual(obj.metadata.ownerReferences, [
      {
        apiVersion: 'owner.kubenode.io/v2',
        kind: 'OwnerResource',
        name: 'owner-resource',
        blockOwnerDeletion: true,
        controller: true,
        uid: 'deadbeef',
      }
    ]);
  });

  test('the same controller reference can be added multiple times', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();

    assert.strictEqual(hasControllerReference(obj), false);
    assert.strictEqual(setControllerReference(own, obj), undefined);
    assert.strictEqual(hasControllerReference(obj), true);
    assert.strictEqual(setControllerReference(own, obj), undefined);
    assert.strictEqual(hasControllerReference(obj), true);
    assert.strictEqual(obj.metadata.ownerReferences.length, 1);
  });

  test('throws if attempting to set different controller references', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();
    const own2 = getOwnerObject();

    assert.strictEqual(setControllerReference(own, obj), undefined);
    assert.strictEqual(hasControllerReference(obj), true);
    own2.kind = 'Foo';
    assert.throws(() => {
      setControllerReference(own2, obj);
    }, { name: 'AlreadyOwnedError' });
  });

  test('cluster-scoped owners are supported', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();
    delete own.metadata.namespace;
    assert.strictEqual(setControllerReference(own, obj), undefined);
    assert.strictEqual(hasControllerReference(obj), true);
  });

  test('cluster-scoped resources cannot have namespaced owners', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();
    delete obj.metadata.namespace;
    assert.throws(() => {
      setControllerReference(own, obj);
    }, /cluster-scoped resource must not have a namespace-scoped owner, owner's namespace is 'mock-namespace-1'/);
    assert.strictEqual(hasControllerReference(obj), false);
  });

  test('namespaced owners must be in same namespace as resource', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();
    own.metadata.namespace = obj.metadata.namespace + '-x';
    assert.throws(() => {
      setControllerReference(own, obj);
    }, /cross-namespace owner references are disallowed, owner's namespace is 'mock-namespace-1-x', object's namespace is 'mock-namespace-1'/);
    assert.strictEqual(hasControllerReference(obj), false);
  });

  test('owner must include a kind', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();
    delete own.kind;
    assert.throws(() => {
      setControllerReference(own, obj);
    }, /object has no kind/);
    assert.strictEqual(hasControllerReference(obj), false);
  });

  test('owner must include an API version', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();
    delete own.apiVersion;
    assert.throws(() => {
      setControllerReference(own, obj);
    }, /object has no version/);
    assert.strictEqual(hasControllerReference(obj), false);
  });
});
