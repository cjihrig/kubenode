import assert from 'node:assert';
import { suite, test } from 'node:test';
import { Context, Manager } from '../lib/index.js';
import { withResolvers } from '../lib/util.js';
import { getManagerOptions } from './test-utils.js';

suite('Manager', () => {
  suite('Manager() constructor', () => {
    test('successfully constructs a Manager instance', () => {
      const options = getManagerOptions();
      const manager = new Manager(options);

      assert.strictEqual(manager instanceof Manager, true);
      assert.strictEqual(manager.started, false);
    });

    test('can be called with no arguments', () => {
      const manager = new Manager();

      assert.strictEqual(manager instanceof Manager, true);
      assert.strictEqual(manager.started, false);
    });

    test('options must be an object', () => {
      assert.throws(() => {
        new Manager(null);
      }, /TypeError: options must be an object/);

      assert.throws(() => {
        new Manager('');
      }, /TypeError: options must be an object/);
    });

    test('options.kubeconfig must be a KubeConfig instance', () => {
      const options = getManagerOptions();
      options.kubeconfig = 'foo';

      assert.throws(() => {
        new Manager(options);
      }, /TypeError: options.kubeconfig must be a KubeConfig instance/);
    });

    test('options.client must be a KubernetesObjectApi instance', () => {
      const options = getManagerOptions();
      options.client = 'foo';

      assert.throws(() => {
        new Manager(options);
      }, /TypeError: options.client must be a KubernetesObjectApi instance/);
    });

    test('options.coordinationClient must be a CoordinationV1Api instance', () => {
      const options = getManagerOptions();
      options.coordinationClient = 'foo';

      assert.throws(() => {
        new Manager(options);
      }, /TypeError: options.coordinationClient must be a CoordinationV1Api instance/);
    });

    test('options.coreClient must be a CoreV1Api instance', () => {
      const options = getManagerOptions();
      options.coreClient = 'foo';

      assert.throws(() => {
        new Manager(options);
      }, /TypeError: options.coreClient must be a CoreV1Api instance/);
    });

    test('options.leaderElection must be a boolean', () => {
      const options = getManagerOptions();
      options.leaderElection = 'foo';

      assert.throws(() => {
        new Manager(options);
      }, /TypeError: options.leaderElection must be a boolean/);
    });

    test('options.leaderElectionName must be a string', () => {
      const options = getManagerOptions();
      options.leaderElectionName = 5;

      assert.throws(() => {
        new Manager(options);
      }, /TypeError: options.leaderElectionName must be a string/);
    });

    test('options.leaderElectionNamespace must be a string', () => {
      const options = getManagerOptions();
      options.leaderElectionNamespace = 5;

      assert.throws(() => {
        new Manager(options);
      }, /TypeError: options.leaderElectionNamespace must be a string/);
    });

    test('options.leaseDuration must be a number', () => {
      const options = getManagerOptions();
      options.leaseDuration = 'foo';

      assert.throws(() => {
        new Manager(options);
      }, /TypeError: options.leaseDuration must be a number/);
    });

    test('options.renewDeadline must be a number', () => {
      const options = getManagerOptions();
      options.renewDeadline = 'foo';

      assert.throws(() => {
        new Manager(options);
      }, /TypeError: options.renewDeadline must be a number/);
    });

    test('options.retryPeriod must be a number', () => {
      const options = getManagerOptions();
      options.retryPeriod = 'foo';

      assert.throws(() => {
        new Manager(options);
      }, /TypeError: options.retryPeriod must be a number/);
    });

    test('clients can be created from kubeconfig', () => {
      const options = getManagerOptions();
      delete options.client;
      delete options.coordinationClient;
      delete options.coreClient;
      const manager = new Manager(options);
      assert.strictEqual(manager instanceof Manager, true);
      assert.strictEqual(manager.started, false);
    });
  });

  suite('Manager.prototype.start()', () => {
    test('starts the controllers without leader election', async () => {
      const startedController = withResolvers();
      const ctx = Context.create();
      const options = getManagerOptions();
      options.leaderElection = false;
      const manager = new Manager(options);
      const controller = {
        start() {
          startedController.resolve();
        },
        stop() {}
      };
      manager.add(controller);
      manager.start(ctx);
      await startedController.promise;
      ctx.cancel();
      await assert.rejects(ctx.done);
    });

    test('throws if started multiple times', async () => {
      const ctx = Context.create();
      const options = getManagerOptions();
      options.retryPeriod = 1;
      const manager = new Manager(options);
      manager.start(ctx);

      assert.strictEqual(manager.started, true);
      await assert.rejects(() => {
        return manager.start(ctx);
      }, /manager already started/);
      ctx.cancel();
      await assert.rejects(ctx.done);
    });
  });

  suite('Manager.prototype.stop()', () => {
    test('stops the controllers without leader election', async () => {
      const startedController = withResolvers();
      const stoppedController = withResolvers();
      const ctx = Context.create();
      const options = getManagerOptions();
      options.leaderElection = false;
      const manager = new Manager(options);
      const controller = {
        start() {
          startedController.resolve();
        },
        stop() {
          stoppedController.resolve();
        }
      };
      manager.add(controller);
      manager.start(ctx);
      await startedController.promise;
      assert.strictEqual(manager.started, true);
      assert.strictEqual(await manager.stop(), undefined);
      await stoppedController.promise;
      assert.strictEqual(manager.started, false);
    });

    test('stops the controllers without leader election using cancellation', async () => {
      const startedController = withResolvers();
      const stoppedController = withResolvers();
      const ctx = Context.create();
      const options = getManagerOptions();
      options.leaderElection = false;
      const manager = new Manager(options);
      const controller = {
        start() {
          startedController.resolve();
        },
        stop() {
          stoppedController.resolve();
        }
      };
      manager.add(controller);
      manager.start(ctx);
      await startedController.promise;
      assert.strictEqual(manager.started, true);
      ctx.cancel();
      await assert.rejects(ctx.done);
      await stoppedController.promise;
      assert.strictEqual(manager.started, false);
    });

    test('is a no-op if the manager is not started', async () => {
      const options = getManagerOptions();
      const manager = new Manager(options);

      assert.strictEqual(manager.started, false);
      assert.strictEqual(await manager.stop(), undefined);
      assert.strictEqual(manager.started, false);
      assert.strictEqual(await manager.stop(), undefined);
      assert.strictEqual(manager.started, false);
    });
  });
});
