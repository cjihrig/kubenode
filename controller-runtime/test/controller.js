import assert from 'node:assert';
import { suite, test } from 'node:test';
import { Context } from '../lib/context.js';
import { Controller } from '../lib/controller.js';
import { Queue } from '../lib/queue.js';
import { Reconciler, Request, TerminalError } from '../lib/reconcile.js';
import { withResolvers } from '../lib/util.js';

class TestReconciler extends Reconciler {
  reconcile(context, request) {
    return false;
  }
}

class TestSource {
  constructor() {
    /** @type Context */
    this.context = null;
    /** @type Queue */
    this.queue = null;
  }
  async start(context, queue) {
    this.context = context;
    this.queue = queue;
  }
}

suite('Controller', () => {
  suite('Controller() constructor', () => {
    test('successfully constructs a Controller instance', () => {
      const reconciler = new TestReconciler();
      const controller = new Controller('foo', { reconciler });

      assert.strictEqual(controller instanceof Controller, true);
      assert.strictEqual(controller.name, 'foo');
      assert.strictEqual(controller.started, false);
    });

    test('throws if name is not a string', () => {
      const reconciler = new TestReconciler();
      assert.throws(() => {
        new Controller(null, { reconciler });
      }, /TypeError: name must be a string/);
    });

    test('throws if options is not an object', () => {
      assert.throws(() => {
        new Controller('foo', null);
      }, /TypeError: options must be an object/);

      assert.throws(() => {
        new Controller('foo', 5);
      }, /TypeError: options must be an object/);
    });

    test('throws if options.reconciler is not a Reconciler', () => {
      assert.throws(() => {
        new Controller('foo', { reconciler: null });
      }, /TypeError: options\.reconciler must be a Reconciler instance/);
    });
  });

  suite('Controller.prototype.reconcile()', () => {
    test('calls the reconciler', (t) => {
      t.mock.method(TestReconciler.prototype, 'reconcile');
      const reconciler = new TestReconciler();
      const controller = new Controller('foo', { reconciler });

      assert.strictEqual(controller.reconcile('ctx', 'req'), false);
      const calls = reconciler.reconcile.mock.calls;
      assert.strictEqual(calls.length, 1);
      assert.strictEqual(calls[0].arguments.length, 2);
      assert.strictEqual(calls[0].arguments[0], 'ctx');
      assert.strictEqual(calls[0].arguments[1], 'req');
    });
  });

  suite('Controller.prototype.start()', () => {
    test('sets started to true after starting', () => {
      const reconciler = new TestReconciler();
      const controller = new Controller('foo', { reconciler });

      assert.strictEqual(controller.started, false);
      assert.strictEqual(controller.start(Context.create()), undefined);
      assert.strictEqual(controller.started, true);
    });

    test('throws if the controller is already started', () => {
      const reconciler = new TestReconciler();
      const ctx = Context.create();
      const controller = new Controller('foo', { reconciler });

      controller.start(ctx);
      assert.throws(() => {
        controller.start(ctx);
      }, /controller already started/);
      assert.strictEqual(controller.started, true);
    });

    test('sources are not started until controller is started', (t) => {
      t.mock.method(TestSource.prototype, 'start');
      const ctx = Context.create();
      const source = new TestSource();
      const reconciler = new TestReconciler();
      const controller = new Controller('foo', { reconciler });

      controller.watch(source);
      assert.strictEqual(source.start.mock.calls.length, 0);
      controller.start(ctx);
      const calls = source.start.mock.calls;
      assert.strictEqual(calls.length, 1);
      assert.strictEqual(calls[0].arguments.length, 2);
      assert.strictEqual(calls[0].arguments[0] instanceof Context, true);
      assert.strictEqual(calls[0].arguments[1] instanceof Queue, true);
    });
  });

  suite('Controller.prototype.watch()', () => {
    test('sources are started immediately if the controller is started', (t) => {
      t.mock.method(TestSource.prototype, 'start');
      const ctx = Context.create();
      const source = new TestSource();
      const reconciler = new TestReconciler();
      const controller = new Controller('foo', { reconciler });

      controller.start(ctx);
      assert.strictEqual(source.start.mock.calls.length, 0);
      controller.watch(source);
      const calls = source.start.mock.calls;
      assert.strictEqual(calls.length, 1);
      assert.strictEqual(calls[0].arguments.length, 2);
      assert.strictEqual(calls[0].arguments[0] instanceof Context, true);
      assert.strictEqual(calls[0].arguments[1] instanceof Queue, true);
    });
  });

  suite('Reconciliation', () => {
    test('handles various requeue scenarios', async () => {
      const ctx = Context.create();
      const source = new TestSource();
      const reconciler = new TestReconciler();
      const controller = new Controller('foo', { reconciler });
      const waiter = withResolvers();
      let cnt = 0;

      reconciler.reconcile = function (context, request) {
        assert.strictEqual(context instanceof Context, true);
        assert.strictEqual(request instanceof Request, true);
        assert.strictEqual(typeof context.reconcileID, 'string');
        assert.strictEqual(request.name, 'bar');
        assert.strictEqual(request.namespace, 'baz');

        cnt++;
        if (cnt === 1) {
          // Trigger an explicit immediate requeue.
          return true;
        } else if (cnt === 2) {
          // Trigger an immediate requeue due to a non-terminal error.
          throw new Error('boom');
        } else if (cnt === 3) {
          // Trigger a delayed requeue.
          return 1;
        } else {
          // Finish the test.
          waiter.resolve();
          return false;
        }
      };

      controller.watch(source);
      controller.start(ctx);
      source.queue.enqueue(new Request('bar', 'baz'));
      await waiter.promise;
      assert.strictEqual(source.queue.data.length, 0);
    });

    test('TerminalErrors are not requeued', async () => {
      const ctx = Context.create();
      const source = new TestSource();
      const reconciler = new TestReconciler();
      const controller = new Controller('foo', { reconciler });
      const waiter = withResolvers();

      reconciler.reconcile = function (context, request) {
        waiter.resolve();
        throw new TerminalError('boom');
      };

      controller.watch(source);
      controller.start(ctx);
      source.queue.enqueue(new Request('bar', 'baz'));
      await waiter.promise;
      assert.strictEqual(source.queue.data.length, 0);
    });

    test('handles data being removed from queue before reading', async (t) => {
      const ctx = Context.create();
      const source = new TestSource();
      const reconciler = new TestReconciler();
      const controller = new Controller('foo', { reconciler });
      const waiter = withResolvers();

      controller.watch(source);
      controller.start(ctx);
      source.queue.enqueue(new Request('bar', 'baz'));
      source.queue.data = [];
      source.queue.on('data', () => {
        assert.strictEqual(source.queue.data.length, 0);
        waiter.resolve();
      });
      await waiter.promise;
    });
  });
});
