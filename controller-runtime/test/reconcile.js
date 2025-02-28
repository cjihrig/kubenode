import assert from 'node:assert';
import { suite, test } from 'node:test';
import {
  Reconciler,
  Request,
  Result,
  TerminalError,
} from '../lib/index.js';

class TestReconciler extends Reconciler {
  async reconcile(context, request, ...rest) {
    assert.strictEqual(rest.length, 0);
    return [context, request];
  }
}

suite('Reconciler', () => {
  suite('Reconciler.prototype.reconcile()', () => {
    test('throws if reconcile() is not overridden', async () => {
      const r = new Reconciler();

      await assert.rejects(async () => {
        await r.reconcile();
      }, /unimplemented reconcile\(\)/);
    });

    test('is meant to be overridden', async () => {
      const r = new TestReconciler();

      assert.strictEqual(r instanceof Reconciler, true);
      assert.deepStrictEqual(await r.reconcile('ctx', 'req'), ['ctx', 'req']);
    });
  });
});

suite('Request', () => {
  suite('Request() constructor', () => {
    test('creates a Request instance', () => {
      const req = new Request('test-name', 'test-namespace');

      assert.strictEqual(req.name, 'test-name');
      assert.strictEqual(req.namespace, 'test-namespace');
    });

    test('namespace defaults to empty string', () => {
      const req = new Request('test-name');

      assert.strictEqual(req.name, 'test-name');
      assert.strictEqual(req.namespace, '');
    });
  });

  suite('Request.prototype.toString()', () => {
    test('converts the Request to a string', () => {
      const req = new Request('test-name', 'test-namespace');

      assert.strictEqual(req.toString(), 'test-namespace/test-name');
    });
  });
});

suite('Result', () => {
  suite('Result() constructor', () => {
    test('creates a Result with no arguments', () => {
      const res = new Result();

      assert.strictEqual(res.requeue, false);
      assert.strictEqual(res.requeueAfter, 0);
    });

    test('creates a Result with a number', () => {
      const res = new Result(5);

      assert.strictEqual(res.requeue, true);
      assert.strictEqual(res.requeueAfter, 5);
    });

    test('creates a Result with a boolean', () => {
      const res1 = new Result(true);
      const res2 = new Result(false);

      assert.strictEqual(res1.requeue, true);
      assert.strictEqual(res1.requeueAfter, 0);
      assert.strictEqual(res2.requeue, false);
      assert.strictEqual(res2.requeueAfter, 0);
    });
  });
});

suite('TerminalError', () => {
  suite('TerminalError() constructor', () => {
    test('creates a TerminalError instance', () => {
      const cause = new Error('boom');
      const err = new TerminalError(cause);

      assert.strictEqual(err instanceof TerminalError, true);
      assert.strictEqual(err instanceof Error, true);
      assert.strictEqual(err.message, 'terminal error');
      assert.strictEqual(err.name, 'TerminalError');
      assert.strictEqual(err.cause, cause);
    });
  });
});
