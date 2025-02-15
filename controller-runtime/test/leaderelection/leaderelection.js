import assert from 'node:assert';
import { suite, test } from 'node:test';
import { LeaderElector } from '../../lib/leaderelection/leaderelection.js';
import { LeaseLock } from '../../lib/leaderelection/leaselock.js';
import {
  createNotFoundError,
  getLeaseLock,
} from './test-utils.js';

function withResolvers() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function getLeaderElectorOptions(mock) {
  return {
    lock: getLeaseLock(mock),
    leaseDuration: 5_000,
    renewDeadline: 5,
    retryPeriod: 1,
    callbacks: {
      onStartedLeading: mock.fn(),
      onStoppedLeading: mock.fn(),
      onNewLeader: mock.fn(),
    },
    name: 'test-leader-elector',
  };
}

suite('LeaderElector', () => {
  suite('LeaderElector() constructor', () => {
    test('successfully creates a LeaderElector', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      const elector = new LeaderElector(options);
      assert.strictEqual(elector instanceof LeaderElector, true);
    });

    test('options must be an object', () => {
      assert.throws(() => {
        new LeaderElector(5);
      }, /TypeError: options must be an object/);
    });

    test('options must not be null', () => {
      assert.throws(() => {
        new LeaderElector(null);
      }, /TypeError: options must be an object/);
    });

    test('options.lock must be an instance of LeaseLock', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.lock = {};
      assert.throws(() => {
        new LeaderElector(options);
      }, /TypeError: options.lock must be a LeaseLock object/);
    });

    test('options.lock must have an identity', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.lock.lockConfig.identity = '';
      assert.throws(() => {
        new LeaderElector(options);
      }, /options.lock.identity cannot be empty/);
    });

    test('options.leaseDuration must be a number', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.leaseDuration = '';
      assert.throws(() => {
        new LeaderElector(options);
      }, /TypeError: options.leaseDuration must be a number/);
    });

    test('options.leaseDuration must be positive', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.leaseDuration = 0;
      assert.throws(() => {
        new LeaderElector(options);
      }, /RangeError: options.leaseDuration must be greater than zero/);
    });

    test('options.renewDeadline must be a number', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.renewDeadline = '';
      assert.throws(() => {
        new LeaderElector(options);
      }, /TypeError: options.renewDeadline must be a number/);
    });

    test('options.renewDeadline must be positive', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.renewDeadline = 0;
      assert.throws(() => {
        new LeaderElector(options);
      }, /RangeError: options.renewDeadline must be greater than zero/);
    });

    test('options.retryPeriod must be a number', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.retryPeriod = '';
      assert.throws(() => {
        new LeaderElector(options);
      }, /TypeError: options.retryPeriod must be a number/);
    });

    test('options.retryPeriod must be positive', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.retryPeriod = 0;
      assert.throws(() => {
        new LeaderElector(options);
      }, /RangeError: options.retryPeriod must be greater than zero/);
    });

    test('options.leaseDuration must be greater than renewDeadline', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.leaseDuration = options.renewDeadline;
      assert.throws(() => {
        new LeaderElector(options);
      }, /RangeError: options.leaseDuration must be greater than options.renewDeadline/);
    });

    test('options.renewDeadline must be greater than jitter-based min', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.renewDeadline = options.retryPeriod;
      assert.throws(() => {
        new LeaderElector(options);
      }, /RangeError: options.renewDeadline must be greater than 1\.20\. the minimum is options.retryPeriod \* jitter \(1\.2\)/);
    });

    test('options.callbacks must be an object', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.callbacks = '';
      assert.throws(() => {
        new LeaderElector(options);
      }, /TypeError: options.callbacks must be a LeaderCallbacks object/);
    });

    test('options.callbacks must not be null', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.callbacks = null;
      assert.throws(() => {
        new LeaderElector(options);
      }, /TypeError: options.callbacks must be a LeaderCallbacks object/);
    });

    test('options.callbacks.onStartedLeading must be a function', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.callbacks.onStartedLeading = '';
      assert.throws(() => {
        new LeaderElector(options);
      }, /TypeError: options.callbacks.onStartedLeading\(\) must be a function/);
    });

    test('options.callbacks.onStoppedLeading must be a function', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.callbacks.onStoppedLeading = '';
      assert.throws(() => {
        new LeaderElector(options);
      }, /TypeError: options.callbacks.onStoppedLeading\(\) must be a function/);
    });

    test('options.callbacks.onNewLeader must be a function or undefined', (t) => {
      const options = getLeaderElectorOptions(t.mock);
      options.callbacks.onNewLeader = '';
      assert.throws(() => {
        new LeaderElector(options);
      }, /TypeError: options.callbacks.onNewLeader\(\) must be a function/);
      options.callbacks.onNewLeader = undefined;
      new LeaderElector(options);
    });
  });

  suite('LeaderElector.prototype.run()', () => {
    test('creates a new lease if one does not exist', async (t) => {
      const options = getLeaderElectorOptions(t.mock);
      const stoppedLeading = withResolvers();
      let startedLeadingCalled = false;
      let newLeaderCalled = false;

      options.lock.client.readNamespacedLease.mock.mockImplementationOnce(() => {
        const err = createNotFoundError();
        throw err;
      });
      options.callbacks = {
        onStartedLeading() {
          const now = Date.now();
          assert.strictEqual(elector.isLeader(), true);
          assert.strictEqual(elector.isLeaseValid(now), true);
          // Change the elector's identity to make the renewal loop time out.
          options.lock.lockConfig.identity = 'foobar';
          assert.strictEqual(elector.isLeader(), false);
          assert.strictEqual(elector.isLeaseValid(now), true);
          startedLeadingCalled = true;
        },
        onStoppedLeading() {
          if (newLeaderCalled && startedLeadingCalled) {
            stoppedLeading.resolve();
          } else {
            stoppedLeading.reject(new Error('expected callbacks not met'));
          }
        },
        onNewLeader(id) {
          assert.strictEqual(id, 'test-id');
          newLeaderCalled = true;
        },
      };

      const elector = new LeaderElector(options);
      elector.run();
      await stoppedLeading.promise;
    });

    test('retries to acquire the lease on initial failure', async (t) => {
      const options = getLeaderElectorOptions(t.mock);
      const stoppedLeading = withResolvers();
      let startedLeadingCalled = false;
      let newLeaderCalled = false;

      options.lock.client.readNamespacedLease.mock.mockImplementationOnce(() => {
        throw new Error('boom');
      });
      options.callbacks = {
        onStartedLeading() {
          const now = Date.now();
          assert.strictEqual(elector.isLeader(), true);
          assert.strictEqual(elector.isLeaseValid(now), true);
          // Change the elector's identity to make the renewal loop time out.
          options.lock.lockConfig.identity = 'foobar';
          assert.strictEqual(elector.isLeader(), false);
          assert.strictEqual(elector.isLeaseValid(now), true);
          startedLeadingCalled = true;
        },
        onStoppedLeading() {
          if (newLeaderCalled && startedLeadingCalled) {
            stoppedLeading.resolve();
          } else {
            stoppedLeading.reject(new Error('expected callbacks not met'));
          }
        },
        onNewLeader(id) {
          assert.strictEqual(id, 'test-id');
          newLeaderCalled = true;
        },
      };

      const elector = new LeaderElector(options);
      elector.run();
      await stoppedLeading.promise;
    });

    test('updates lease on slow path if fast path fails', async (t) => {
      const options = getLeaderElectorOptions(t.mock);
      const stoppedLeading = withResolvers();
      let startedLeadingCalled = false;
      let newLeaderCalled = false;

      options.lock.client.replaceNamespacedLease.mock.mockImplementationOnce(() => {
        throw new Error('boom');
      });

      options.callbacks = {
        onStartedLeading() {
          const now = Date.now();
          assert.strictEqual(elector.isLeader(), true);
          assert.strictEqual(elector.isLeaseValid(now), true);
          // Change the elector's identity to make the renewal loop time out.
          options.lock.lockConfig.identity = 'foobar';
          assert.strictEqual(elector.isLeader(), false);
          assert.strictEqual(elector.isLeaseValid(now), true);
          startedLeadingCalled = true;
        },
        onStoppedLeading() {
          if (newLeaderCalled && startedLeadingCalled) {
            stoppedLeading.resolve();
          } else {
            stoppedLeading.reject(new Error('expected callbacks not met'));
          }
        },
        onNewLeader(id) {
          assert.strictEqual(id, 'test-id');
          newLeaderCalled = true;
        },
      };

      const elector = new LeaderElector(options);
      elector.run();
      await stoppedLeading.promise;
    });
  });
});
