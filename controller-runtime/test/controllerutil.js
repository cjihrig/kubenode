import assert from 'node:assert';
import { suite, test } from 'node:test';
import {
  AlreadyOwnedError,
  addFinalizer,
  containsFinalizer,
  hasControllerReference,
  hasOwnerReference,
  removeFinalizer,
  setControllerReference,
  setOwnerReference,
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

function getOwnerObject() {
  const own = mockK8sObject();
  own.apiVersion = 'owner.kubenode.io/v2';
  own.kind = 'OwnerResource';
  own.metadata.name = 'owner-resource';
  own.metadata.uid = 'deadbeef';
  return own;
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

suite('hasOwnerReference()', () => {
  test('returns false if reference is not matched', () => {
    const obj = mockK8sObject();
    const owners = [{}];
    assert.strictEqual(hasOwnerReference(owners, obj), false);
  });

  test('returns true if reference is matched', () => {
    const obj = mockK8sObject();
    const own = {
      apiVersion: obj.apiVersion,
      kind: obj.kind,
      name: obj.metadata.name,
    }
    const owners = [own];
    assert.strictEqual(hasOwnerReference(owners, obj), true);
  });
});

suite('setOwnerReference()', () => {
  test('successfully adds an owner reference', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();

    assert.strictEqual(
      hasOwnerReference(obj.metadata.ownerReferences, own),
      false
    );
    assert.deepStrictEqual(obj.metadata.ownerReferences, undefined);
    assert.strictEqual(setOwnerReference(own, obj), undefined);
    assert.strictEqual(
      hasOwnerReference(obj.metadata.ownerReferences, own),
      true
    );
    assert.deepStrictEqual(obj.metadata.ownerReferences, [
      {
        apiVersion: 'owner.kubenode.io/v2',
        kind: 'OwnerResource',
        name: 'owner-resource',
        blockOwnerDeletion: false,
        controller: false,
        uid: 'deadbeef',
      }
    ]);
  });

  test('an existing owner is overwritten', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();
    const own2 = getOwnerObject();

    own.metadata.uid = 'aaaaaa';
    own2.metadata.uid = 'cccccc';
    assert.strictEqual(setOwnerReference(own, obj), undefined);
    assert.strictEqual(
      hasOwnerReference(obj.metadata.ownerReferences, own),
      true
    );
    assert.strictEqual(obj.metadata.ownerReferences[0].uid, 'aaaaaa');
    assert.strictEqual(setOwnerReference(own2, obj), undefined);
    assert.strictEqual(
      hasOwnerReference(obj.metadata.ownerReferences, own2),
      true
    );
    assert.strictEqual(obj.metadata.ownerReferences.length, 1);
    assert.strictEqual(obj.metadata.ownerReferences[0].uid, 'cccccc');
  });

  test('cluster-scoped owners are supported', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();
    delete own.metadata.namespace;
    assert.strictEqual(setOwnerReference(own, obj), undefined);
    assert.strictEqual(
      hasOwnerReference(obj.metadata.ownerReferences, own),
      true
    );
  });

  test('cluster-scoped resources cannot have namespaced owners', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();
    delete obj.metadata.namespace;
    assert.throws(() => {
      setOwnerReference(own, obj);
    }, /cluster-scoped resource must not have a namespace-scoped owner, owner's namespace is 'mock-namespace-1'/);
    assert.strictEqual(
      hasOwnerReference(obj.metadata.ownerReferences, own),
      false
    );
  });

  test('namespaced owners must be in same namespace as resource', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();
    own.metadata.namespace = obj.metadata.namespace + '-x';
    assert.throws(() => {
      setOwnerReference(own, obj);
    }, /cross-namespace owner references are disallowed, owner's namespace is 'mock-namespace-1-x', object's namespace is 'mock-namespace-1'/);
    assert.strictEqual(
      hasOwnerReference(obj.metadata.ownerReferences, own),
      false
    );
  });

  test('owner must include a kind', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();
    delete own.kind;
    assert.throws(() => {
      setOwnerReference(own, obj);
    }, /object has no kind/);
    assert.strictEqual(
      hasOwnerReference(obj.metadata.ownerReferences, getOwnerObject()),
      false
    );
  });

  test('owner must include an API version', () => {
    const obj = mockK8sObject();
    const own = getOwnerObject();
    delete own.apiVersion;
    assert.throws(() => {
      setOwnerReference(own, obj);
    }, /object has no version/);
    assert.strictEqual(
      hasOwnerReference(obj.metadata.ownerReferences, getOwnerObject()),
      false
    );
  });
});
