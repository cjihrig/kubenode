import { setTimeout as sleep } from 'node:timers/promises';
import { isDeepStrictEqual } from 'node:util';
import { V1MicroTime } from '@kubernetes/client-node';
import { isNotFound } from '../apimachinery/errors.js';
import { Context } from '../context.js';
import { LeaseLock } from './leaselock.js';

/**
 * @typedef {import('./leaselock.js').LeaderElectionRecord} LeaderElectionRecord
 *
 * @typedef {Object} LeaderCallbacks
 * @property {() => void} onStartedLeading Called when the LeaderElector starts
 * leading.
 * @property {() => void} onStoppedLeading Called when the LeaderElector stops
 * leading. This is also called when the LeaderElector exits, even if it did
 * not start leading.
 * @property {(identity: string) => void} onNewLeader Called when the client
 * observes a leader that is not the previously observed leader. This includes
 * the first observed leader when the client starts.
 *
 * @typedef {Object} LeaderElectionConfig
 * @property {LeaseLock} lock The resource that will be used for locking.
 * @property {number} leaseDuration A client needs to wait a full leaseDuration
 * without observing a change to the record before it can attempt to take over.
 * When all clients are shutdown and a new set of clients are started with
 * different names against the same leader record, they must wait the full
 * leaseDuration before attempting to acquire the lease. Thus, leaseDuration
 * should be as short as possible (within your tolerance for clock skew rate)
 * to avoid possible long waits. leaseDuration is measured in milliseconds.
 * @property {number} renewDeadline The number of milliseconds that the acting
 * leader will retry refreshing leadership before giving up.
 * @property {number} retryPeriod The number of milliseconds the client should
 * wait between tries of actions.
 * @property {LeaderCallbacks} callbacks Callbacks that are invoked at various
 * lifecycle events of the LeaderElector.
 * @property {string} name The name of the resource lock.
 */

const kJitterFactor = 1.2;

/**
 * LeaderElector implements a leader election client.
 */
export class LeaderElector {
  /**
   * Construct a LeaderElector.
   * @param {LeaderElectionConfig} options - Leader election configuration
   * options.
   */
  constructor(options) {
    if (options === null || typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }

    const {
      lock,
      leaseDuration,
      renewDeadline,
      retryPeriod,
      callbacks,
      name,
    } = options;

    validateLeaseLock(lock, 'options.lock');
    validatePositiveInt(leaseDuration, 'options.leaseDuration');
    validatePositiveInt(renewDeadline, 'options.renewDeadline');
    validatePositiveInt(retryPeriod, 'options.retryPeriod');

    if (leaseDuration <= renewDeadline) {
      const msg = 'options.leaseDuration must be greater than ' +
        'options.renewDeadline';
      throw new RangeError(msg);
    }

    if (renewDeadline <= kJitterFactor * retryPeriod) {
      const min = (kJitterFactor * retryPeriod).toFixed(2);
      const msg = `options.renewDeadline must be greater than ${min}. ` +
        `the minimum is options.retryPeriod * jitter (${kJitterFactor})`;
      throw new RangeError(msg);
    }

    validateLeaderCallbacks(callbacks, 'options.callbacks');

    this.lock = lock;
    this.leaseDuration = leaseDuration;
    this.renewDeadline = renewDeadline;
    this.retryPeriod = retryPeriod;
    this.callbacks = callbacks;
    this.name = name;
    /** @type {LeaderElectionRecord} */
    this.record = null;
    this.observedTime = 0;
    this.leaseValidUntil = 0;
  }

  /**
   * run() starts the leader election loop.
   * @param {Context} ctx - The context to use.
   * @returns {Promise<void>}
   */
  async run(ctx) {
    if (!(ctx instanceof Context)) {
      throw new TypeError('ctx must be a Context instance');
    }

    const acquired = await this.#acquire(ctx);
    if (!acquired) {
      return;
    }

    queueMicrotask(() => {
      this.callbacks.onStartedLeading();
    });
    await this.#renew(ctx);
    queueMicrotask(() => {
      this.callbacks.onStoppedLeading();
    });
  }

  /**
   * isLeader() returns true if the last observed leader was this client, and
   * false otherwise.
   * @returns {boolean}
   */
  isLeader() {
    return this.lock.identity === this.record?.holderIdentity;
  }

  /**
   * isLeaseValid() returns true if the lease is valid at the time provided,
   * and false otherwise.
   * @param {number} time - The time to check the lease against.
   * @returns {boolean}
   */
  isLeaseValid(time) {
    return this.leaseValidUntil > time;
  }

  /**
   * setRecord() sets the current LeaderElectionRecord. It also records the
   * observed time for the purposes of determining if the lease has expired.
   * @param {LeaderElectionRecord} record - The new LeaderElectionRecord.
   */
  #setRecord(record) {
    this.record = record;
    const now = Date.now();
    const leaseDurationMs = record.leaseDurationSeconds * 1000;
    this.observedTime = now;
    this.leaseValidUntil = now + leaseDurationMs;
  }

  /**
   * acquire() loops calling tryAcquireOrRenew() and returns true when the lease
   * is successfully acquired.
   * @param {Context} ctx - The context to use.
   * @returns {Promise<boolean>}
   */
  async #acquire(ctx) {
    const cancel = ctx.done.catch(() => {});
    let success = false;

    while (!ctx.signal.aborted) {
      const oldRecord = this.record;

      success = await this.#tryAcquireOrRenew(ctx);
      this.#maybeReportNewLeader(oldRecord, this.record);

      if (success) {
        break;
      }

      await Promise.race([
        sleep(jitter(this.retryPeriod, kJitterFactor)),
        cancel,
      ]);
    }

    this.lock.recordEvent('became leader');
    return success;
  }

  /**
   * renew() loops calling tryAcquireOrRenew() and returns when
   * tryAcquireOrRenew() fails.
   * @param {Context} ctx - The context to use.
   * @returns {Promise<void>}
   */
  async #renew(ctx) {
    const cancel = ctx.done.catch(() => {});

    while (!ctx.signal.aborted) {
      const oldRecord = this.record;
      const renewStart = Date.now();
      let success = false;
      let expired = false;

      while (!success && !expired) {
        success = await this.#tryAcquireOrRenew(ctx);
        expired = Date.now() - renewStart > this.renewDeadline;
        await Promise.race([sleep(this.retryPeriod), cancel]);
      }

      this.#maybeReportNewLeader(oldRecord, this.record);

      if (!success) {
        // Failed to renew the lease.
        break;
      }
    }

    this.lock.recordEvent('stopped leading');
  }

  /**
   * maybeReportNewLeader() calls the onNewLeader() callback if the lease holder
   * has changed and an onNewLeader() callback is registered.
   * @param {LeaderElectionRecord} oldRecord - The previous leader election
   * record.
   * @param {LeaderElectionRecord} newRecord - The current leader election
   * record.
   */
  #maybeReportNewLeader(oldRecord, newRecord) {
    const cb = this.callbacks.onNewLeader;

    if (typeof cb !== 'function' || !newRecord ||
        oldRecord?.holderIdentity === newRecord.holderIdentity) {
      return;
    }

    queueMicrotask(() => {
      cb(newRecord.holderIdentity);
    });
  }

  /**
   * tryAcquireOrRenew() tries to acquire a leader lease if it is not already
   * acquired. Otherwise, it tries to renew the lease if it has already been
   * acquired. Returns true on success.
   * @param {Context} ctx - The context to use.
   * @returns {Promise<boolean>}
   */
  async #tryAcquireOrRenew(ctx) {
    const now = Date.now();
    const date = new V1MicroTime(now);
    /** @type LeaderElectionRecord */
    const leaderElectionRecord = {
      holderIdentity: this.lock.identity,
      leaseDurationSeconds: this.leaseDuration / 1000,
      leaderTransitions: 0,
      acquireTime: date,
      renewTime: date,
    };

    // Fast path for the leader to update optimistically assuming that the
    // record observed last time is the current version.
    if (this.isLeader() && this.isLeaseValid(now)) {
      const oldObservedRecord = this.record;
      leaderElectionRecord.acquireTime = oldObservedRecord.acquireTime;
      leaderElectionRecord.leaderTransitions =
        oldObservedRecord.leaderTransitions;

      try {
        await this.lock.update(leaderElectionRecord);
        this.#setRecord(leaderElectionRecord);
        return true;
      } catch {
        // Failed to update lock optimistically. Falling back to the slow path.
      }
    }

    // Obtain or create the LeaderElectionRecord.
    /** @type LeaderElectionRecord */
    let oldLeaderElectionRecord;
    try {
      oldLeaderElectionRecord = await this.lock.get();
    } catch (err) {
      if (!isNotFound(err)) {
        // Error retrieving resource lock.
        return false;
      }

      try {
        await this.lock.create(leaderElectionRecord);
      } catch {
        // Error initially creating LeaderElectionRecord.
        return false;
      }

      this.#setRecord(leaderElectionRecord);
      return true;
    }

    // The LeaderElectionRecord has been obtained. Check the identity and time.
    if (!isDeepStrictEqual(this.record, oldLeaderElectionRecord)) {
      this.#setRecord(oldLeaderElectionRecord);
    }

    if (this.isLeaseValid(now) && !this.isLeader() &&
        oldLeaderElectionRecord.holderIdentity) {
      // Lock is already held and has not yet expired.
      return false;
    }

    // Try to update. The LeaderElectionRecord is set to its default here.
    // Correct it before updating.
    if (this.isLeader()) {
      leaderElectionRecord.acquireTime = oldLeaderElectionRecord.acquireTime;
      leaderElectionRecord.leaderTransitions =
        oldLeaderElectionRecord.leaderTransitions;
    } else {
      leaderElectionRecord.leaderTransitions =
        oldLeaderElectionRecord.leaderTransitions + 1;
    }

    // Update the lock itself.
    try {
      await this.lock.update(leaderElectionRecord);
    } catch {
      // Failed to update the lock.
      return false;
    }

    this.#setRecord(leaderElectionRecord);
    return true;
  }
}

function validateLeaseLock(value, name) {
  if (!(value instanceof LeaseLock)) {
    throw new TypeError(`${name} must be a LeaseLock object`);
  }

  if (value.identity === '') {
    throw new Error(`${name}.identity cannot be empty`);
  }
}

function validateLeaderCallbacks(value, name) {
  if (value === null || typeof value !== 'object') {
    throw new TypeError(`${name} must be a LeaderCallbacks object`);
  }

  if (typeof value.onStartedLeading !== 'function') {
    throw new TypeError(`${name}.onStartedLeading() must be a function`);
  }

  if (typeof value.onStoppedLeading !== 'function') {
    throw new TypeError(`${name}.onStoppedLeading() must be a function`);
  }

  if (value.onNewLeader !== undefined &&
      typeof value.onNewLeader !== 'function') {
    throw new TypeError(`${name}.onNewLeader() must be a function`);
  }
}

function validatePositiveInt(value, name) {
  if (typeof value !== 'number') {
    throw new TypeError(`${name} must be a number`);
  }

  if (value <= 0) {
    throw new RangeError(`${name} must be greater than zero`);
  }
}

/**
 * jitter() returns a number between duration and
 * (duration + maxJitterFactor * duration).
 * @param {number} duration - The duration to apply jitter to.
 * @param {number} maxJitterFactor - The maximum amount of jitter to apply.
 * @returns {number}
 */
function jitter(duration, maxJitterFactor) {
  return duration + (Math.random() * maxJitterFactor * duration);
}

export default {
  LeaderElector,
}
