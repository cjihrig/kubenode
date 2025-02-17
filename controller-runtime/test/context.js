import assert from 'node:assert';
import { suite, test } from 'node:test';
import { Context } from '../lib/context.js';

suite('Context', () => {
  suite('Context() constructor', () => {
    test('cannot be constructed directly', () => {
      assert.throws(() => {
        new Context();
      }, /Error: illegal constructor/);
    });
  });

  suite('Context.create()', () => {
    test('creates a new context instance', () => {
      const ctx = Context.create();

      assert.strictEqual(ctx instanceof Context, true);
      assert.strictEqual(ctx.done instanceof Promise, true);
      assert.strictEqual(ctx.signal instanceof AbortSignal, true);
      assert.strictEqual(ctx.values instanceof Map, true);
    });
  });

  suite('Context.prototype.child()', () => {
    test('creates a child context', () => {
      const parent = Context.create();
      const child = parent.child();

      assert.strictEqual(child instanceof Context, true);
      assert.strictEqual(child.done instanceof Promise, true);
      assert.strictEqual(child.signal instanceof AbortSignal, true);
      assert.strictEqual(child.values instanceof Map, true);
      assert.notStrictEqual(child.done, parent.done);
      assert.notStrictEqual(child.signal, parent.signal);
      assert.notStrictEqual(child.values, parent.values);
    });
  });

  suite('Context.prototype.cancel()', () => {
    test('aborts the signal', async () => {
      const ctx = Context.create();

      assert.strictEqual(ctx.signal.aborted, false);
      ctx.cancel();
      assert.strictEqual(ctx.signal.aborted, true);
      await assert.rejects(ctx.done);
    });

    test('parent aborts the signal of a child context', async () => {
      const parent = Context.create();
      const child = parent.child();

      assert.strictEqual(child.signal.aborted, false);
      parent.cancel();
      assert.strictEqual(child.signal.aborted, true);
      await assert.rejects(parent.done);
      await assert.rejects(child.done);
    });

    test('child does not abort the signal of the parent context', async () => {
      const parent = Context.create();
      const child = parent.child();

      assert.strictEqual(child.signal.aborted, false);
      assert.strictEqual(parent.signal.aborted, false);
      child.cancel();
      assert.strictEqual(child.signal.aborted, true);
      assert.strictEqual(parent.signal.aborted, false);
      await assert.rejects(child.done);
    });
  });
});
