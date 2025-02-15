import assert from 'node:assert';
import { suite, test } from 'node:test';
import { LeaseLock } from '../../lib/leaderelection/leaselock.js';
import {
  getClient,
  getLockConfig,
  getMetaObject,
  getRecord,
} from './test-utils.js';

suite('LeaseLock', () => {
  test('LeaseLock() constructor', (t) => {
    const meta = getMetaObject();
    const client = getClient(t.mock);
    const lockConfig = getLockConfig(t.mock);
    const ll = new LeaseLock(meta, client, lockConfig);
    assert.strictEqual(ll.leaseMeta, meta);
    assert.strictEqual(ll.client, client);
    assert.strictEqual(ll.lockConfig, lockConfig);
    assert.strictEqual(ll.lease, null);
  });

  test('LeaseLock.prototype.create()', async (t) => {
    const meta = getMetaObject();
    const client = getClient(t.mock);
    const lockConfig = getLockConfig(t.mock);
    const ll = new LeaseLock(meta, client, lockConfig);
    const record = getRecord();
    assert.strictEqual(ll.lease, null);
    assert.strictEqual(await ll.create(record), undefined);
    assert.strictEqual(ll.lease.metadata.name, 'test-name');
  });

  test('LeaseLock.prototype.get()', async (t) => {
    const meta = getMetaObject();
    const client = getClient(t.mock);
    const lockConfig = getLockConfig(t.mock);
    const ll = new LeaseLock(meta, client, lockConfig);
    assert.strictEqual(await ll.create(getRecord()), undefined);
    const record = await ll.get();
    assert.strictEqual(record.holderIdentity, 'foo');
    assert.strictEqual(record.leaseDurationSeconds, 15);
    assert.ok(record.acquireTime);
    assert.strictEqual(
      record.renewTime.getTime(), record.acquireTime.getTime() + 2 * 60_000
    );
    assert.strictEqual(record.leaderTransitions, 100);
    assert.strictEqual(record.strategy, undefined);
    assert.strictEqual(record.preferredHolder, undefined);
    assert.strictEqual(ll.lease.spec.holderIdentity, 'foo');
  });

  suite('LeaseLock.prototype.update()', () => {
    test('updates the lease object', async (t) => {
      const meta = getMetaObject();
      const client = getClient(t.mock);
      const lockConfig = getLockConfig(t.mock);
      const ll = new LeaseLock(meta, client, lockConfig);
      const record = getRecord();
      assert.strictEqual(await ll.create(record), undefined);
      assert.strictEqual(ll.lease.spec.holderIdentity, 'foo');
      record.holderIdentity = 'bar';
      assert.strictEqual(await ll.update(record), undefined);
      assert.strictEqual(ll.lease.spec.holderIdentity, 'bar');
    });

    test('throws if the lease is uninitialized', async (t) => {
      const meta = getMetaObject();
      const client = getClient(t.mock);
      const lockConfig = getLockConfig(t.mock);
      const ll = new LeaseLock(meta, client, lockConfig);
      const record = getRecord();

      await assert.rejects(() => {
        return ll.update(record);
      }, /the lease is not initialized. call create\(\) or get\(\) first/);
    });
  });

  test('LeaseLock.prototype.identity', (t) => {
    const meta = getMetaObject();
    const client = getClient(t.mock);
    const lockConfig = getLockConfig(t.mock);
    const ll = new LeaseLock(meta, client, lockConfig);
    assert.strictEqual(ll.identity, 'test-id');
  });

  test('LeaseLock.prototype.toString()', (t) => {
    const meta = getMetaObject();
    const client = getClient(t.mock);
    const lockConfig = getLockConfig(t.mock);
    const ll = new LeaseLock(meta, client, lockConfig);
    assert.strictEqual(ll.toString(), 'test-ns/test-name');
  });

  suite('LeaseLock.prototype.recordEvent()', () => {
    test('records an event without initializing the lease', (t) => {
      const meta = getMetaObject();
      const client = getClient(t.mock);
      const lockConfig = getLockConfig(t.mock);
      const ll = new LeaseLock(meta, client, lockConfig);
      const spy = ll.lockConfig.eventRecorder.event.mock;

      assert.strictEqual(spy.calls.length, 0);
      assert.strictEqual(ll.recordEvent('foobar'), undefined);
      assert.strictEqual(spy.calls.length, 1);
      const args = ll.lockConfig.eventRecorder.event.mock.calls[0].arguments;
      assert.strictEqual(args.length, 4);
      assert.deepStrictEqual(args[0], {
        apiVersion: 'coordination.k8s.io/v1',
        kind: 'Lease',
        metadata: {
          name: 'test-name',
          namespace: 'test-ns',
        }
      });
      assert.strictEqual(args[1], 'Normal');
      assert.strictEqual(args[2], 'LeaderElection');
      assert.strictEqual(args[3], 'test-id foobar');
    });

    test('records an event after initializing the lease', async (t) => {
      const meta = getMetaObject();
      const client = getClient(t.mock);
      const lockConfig = getLockConfig(t.mock);
      const ll = new LeaseLock(meta, client, lockConfig);
      const spy = ll.lockConfig.eventRecorder.event.mock;

      assert.strictEqual(await ll.create(getRecord()), undefined);
      ll.lease.metadata.name = 'changed-name';
      assert.strictEqual(spy.calls.length, 0);
      assert.strictEqual(ll.recordEvent('foobar'), undefined);
      assert.strictEqual(spy.calls.length, 1);
      const args = ll.lockConfig.eventRecorder.event.mock.calls[0].arguments;
      assert.strictEqual(args.length, 4);
      assert.deepStrictEqual(args[0], {
        apiVersion: 'coordination.k8s.io/v1',
        kind: 'Lease',
        metadata: {
          name: 'changed-name',
          namespace: 'test-ns',
        }
      });
      assert.strictEqual(args[1], 'Normal');
      assert.strictEqual(args[2], 'LeaderElection');
      assert.strictEqual(args[3], 'test-id foobar');
    });

    test('is a no-op if event recording is not enabled on the lock', (t) => {
      const meta = getMetaObject();
      const client = getClient(t.mock);
      const ll = new LeaseLock(meta, client, null);

      // There isn't much to test other than successful execution.
      assert.strictEqual(ll.lockConfig, null);
      assert.strictEqual(ll.recordEvent('foobar'), undefined);
    });
  });
});
