import assert from 'node:assert';
import { suite, test } from 'node:test';
import { Context } from '../lib/context.js';
import { Queue } from '../lib/queue.js';
import { Source } from '../lib/source.js';
import { getSourceOptions } from './test-utils.js';

suite('Source', () => {
  suite('Source() constructor', () => {
    test('successfully constructs a Source instance', () => {
      const o = getSourceOptions();
      const source = new Source(o.kubeconfig, o.client, o.kind, o.apiVersion);

      assert.strictEqual(source instanceof Source, true);
      assert.strictEqual(source.kubeconfig, o.kubeconfig);
      assert.strictEqual(source.client, o.client);
      assert.strictEqual(source.kind, o.kind);
      assert.strictEqual(source.apiVersion, o.apiVersion);
    });

    test('kubeconfig argument must be a KubeConfig instance', () => {
      const o = getSourceOptions();
      o.kubeconfig = null;

      assert.throws(() => {
        new Source(o.kubeconfig, o.client, o.kind, o.apiVersion);
      }, /TypeError: kubeconfig must be a KubeConfig instance/);
    });

    test('client argument must be a KubernetesObjectApi instance', () => {
      const o = getSourceOptions();
      o.client = null;

      assert.throws(() => {
        new Source(o.kubeconfig, o.client, o.kind, o.apiVersion);
      }, /TypeError: client must be a KubernetesObjectApi instance/);
    });

    test('kind argument must be a string', () => {
      const o = getSourceOptions();
      o.kind = null;

      assert.throws(() => {
        new Source(o.kubeconfig, o.client, o.kind, o.apiVersion);
      }, /TypeError: kind must be a string/);
    });

    test('apiVersion argument must be a string', () => {
      const o = getSourceOptions();
      o.apiVersion = null;

      assert.throws(() => {
        new Source(o.kubeconfig, o.client, o.kind, o.apiVersion);
      }, /TypeError: apiVersion must be a string/);
    });
  });

  suite('Source.prototype.start()', () => {
    test('context argument must be a Context instance', async () => {
      const o = getSourceOptions();
      const queue = new Queue();
      const source = new Source(o.kubeconfig, o.client, o.kind, o.apiVersion);

      await assert.rejects(async () => {
        await source.start(null, queue);
      }, /TypeError: context must be a Context instance/);
    });

    test('queue argument must be a Queue instance', async () => {
      const o = getSourceOptions();
      const context = Context.create();
      const source = new Source(o.kubeconfig, o.client, o.kind, o.apiVersion);

      await assert.rejects(async () => {
        await source.start(context, null);
      }, /TypeError: queue must be a Queue instance/);
    });
  });
});
