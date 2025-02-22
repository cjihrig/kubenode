/**
 * @typedef {import('@kubernetes/client-node').CoordinationV1Api} CoordinationV1Api
 * @typedef {import('@kubernetes/client-node').KubernetesObject} KubernetesObject
 * @typedef {import('@kubernetes/client-node').V1Lease} V1Lease
 * @typedef {import('@kubernetes/client-node').V1MicroTime} V1MicroTime
 * @typedef {import('@kubernetes/client-node').V1ObjectMeta} V1ObjectMeta
 * @typedef {import('../record/recorder.js').EventRecorder} EventRecorder
 *
 * @typedef {Object} LeaderElectionRecord
 * @property {string} holderIdentity The identity of the holder of a current
 * lease.
 * @property {number} leaseDurationSeconds Duration that candidates for a lease
 * need to wait to force acquire it.
 * @property {V1MicroTime} acquireTime Time when the current lease was acquired.
 * @property {V1MicroTime} renewTime Time when the current holder of a lease
 * has last updated the lease.
 * @property {number} leaderTransitions The number of transitions of a lease
 * between holders.
 * @property {string} [strategy] The strategy for picking the leader for
 * coordinated leader election.
 * @property {string} [preferredHolder] Signals to a lease holder that the
 * lease has a more optimal holder and should be given up.
 *
 * @typedef {Object} ResourceLockConfig
 * @property {string} identity Unique string identifying a lease holder across
 * all participants in an election.
 * @property {EventRecorder} [eventRecorder] Used to record changes to the lock.
 */

const kLeaseAPIVersion = 'coordination.k8s.io/v1';
const kLeaseKind = 'Lease';

/**
 * LeaseLock implements distributed locking using Kubernetes leases.
 */
export class LeaseLock {
  /**
   * Construct a LeaseLock. leaseMeta should contain a name and namespace that
   * the leader elector will attempt to lead.
   * @param {V1ObjectMeta} leaseMeta - Kubernetes object meta.
   * @param {CoordinationV1Api} client - Kubernetes coordination v1 client.
   * @param {ResourceLockConfig} lockConfig - Configuration for the lock.
   */
  constructor(leaseMeta, client, lockConfig) {
    this.leaseMeta = leaseMeta;
    this.client = client;
    this.lockConfig = lockConfig;
    /** @type {V1Lease} */
    this.lease = null;
  }

  /**
   * create() creates a new Kubernetes Lease object.
   * @param {LeaderElectionRecord} record - Configuration of the lease.
   * @returns {Promise<void>}
   */
  async create(record) {
    const lease = await this.client.createNamespacedLease({
      namespace: this.leaseMeta.namespace,
      body: {
        apiVersion: kLeaseAPIVersion,
        kind: kLeaseKind,
        metadata: {
          name: this.leaseMeta.name,
          namespace: this.leaseMeta.namespace,
        },
        spec: {
          holderIdentity: record.holderIdentity,
          leaseDurationSeconds: record.leaseDurationSeconds,
          acquireTime: record.acquireTime,
          renewTime: record.renewTime,
          leaseTransitions: record.leaderTransitions,
          strategy: record.strategy,
          preferredHolder: record.preferredHolder,
        }
      }
    });

    this.lease = lease;
  }

  /**
   * get() retrieves the Kubernetes Lease object corresponding to the lock.
   * @returns {Promise<LeaderElectionRecord>}
   */
  async get() {
    const lease = await this.client.readNamespacedLease({
      name: this.leaseMeta.name,
      namespace: this.leaseMeta.namespace,
    });

    this.lease = lease;
    return {
      holderIdentity: lease.spec.holderIdentity,
      leaseDurationSeconds: lease.spec.leaseDurationSeconds,
      acquireTime: lease.spec.acquireTime,
      renewTime: lease.spec.renewTime,
      leaderTransitions: lease.spec.leaseTransitions,
      strategy: lease.spec.strategy,
      preferredHolder: lease.spec.preferredHolder,
    };
  }

  /**
   * update() updates the Kubernetes Lease object for the lock.
   * @param {LeaderElectionRecord} record - Configuration of the lease.
   * @returns {Promise<void>}
   */
  async update(record) {
    if (this.lease === null) {
      const msg = 'the lease is not initialized. call create() or get() first';
      throw new Error(msg);
    }

    this.lease.spec = {
      holderIdentity: record.holderIdentity,
      leaseDurationSeconds: record.leaseDurationSeconds,
      acquireTime: record.acquireTime,
      renewTime: record.renewTime,
      leaseTransitions: record.leaderTransitions,
      strategy: record.strategy,
      preferredHolder: record.preferredHolder,
    };

    const lease = await this.client.replaceNamespacedLease({
      name: this.leaseMeta.name,
      namespace: this.leaseMeta.namespace,
      body: this.lease,
    });

    this.lease = lease;
  }

  /**
   * recordEvent() records events with additional metadata during leader
   * election.
   * @param {string} s - String representation of the event being recorded.
   */
  recordEvent(s) {
    if (typeof this.lockConfig?.eventRecorder?.event !== 'function') {
      return;
    }

    const subject = {
      apiVersion: kLeaseAPIVersion,
      kind: kLeaseKind,
      metadata: this.lease?.metadata ?? this.leaseMeta,
    };

    this.lockConfig.eventRecorder.event(
      subject, 'Normal', 'LeaderElection', `${this.lockConfig.identity} ${s}`
    );
  }

  /**
   * The identity of the lock.
   * @type {string}
   */
  get identity() {
    return this.lockConfig.identity;
  }

  /**
   * toString() returns a string representation of the LeaseLock.
   * @returns {string}
   */
  toString() {
    return `${this.leaseMeta.namespace}/${this.leaseMeta.name}`;
  }
}

export default {
  LeaseLock,
};
