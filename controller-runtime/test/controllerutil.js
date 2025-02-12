import assert from 'node:assert';
import { suite, test } from 'node:test';
import {
  addFinalizer,
  containsFinalizer,
  removeFinalizer,
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
