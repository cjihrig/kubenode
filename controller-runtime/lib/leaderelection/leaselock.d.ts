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
    constructor(leaseMeta: V1ObjectMeta, client: CoordinationV1Api, lockConfig: ResourceLockConfig);
    leaseMeta: import("@kubernetes/client-node").V1ObjectMeta;
    client: import("@kubernetes/client-node").CoordinationV1Api;
    lockConfig: ResourceLockConfig;
    /** @type {V1Lease} */
    lease: V1Lease;
    /**
     * create() creates a new Kubernetes Lease object.
     * @param {LeaderElectionRecord} record - Configuration of the lease.
     * @returns {Promise<void>}
     */
    create(record: LeaderElectionRecord): Promise<void>;
    /**
     * get() retrieves the Kubernetes Lease object corresponding to the lock.
     * @returns {Promise<LeaderElectionRecord>}
     */
    get(): Promise<LeaderElectionRecord>;
    /**
     * update() updates the Kubernetes Lease object for the lock.
     * @param {LeaderElectionRecord} record - Configuration of the lease.
     * @returns {Promise<void>}
     */
    update(record: LeaderElectionRecord): Promise<void>;
    /**
     * recordEvent() records events with additional metadata during leader
     * election.
     * @param {string} s - String representation of the event being recorded.
     */
    recordEvent(s: string): void;
    /**
     * The identity of the lock.
     * @type {string}
     */
    get identity(): string;
    /**
     * toString() returns a string representation of the LeaseLock.
     * @returns {string}
     */
    toString(): string;
}
declare namespace _default {
    export { LeaseLock };
}
export default _default;
export type CoordinationV1Api = import("@kubernetes/client-node").CoordinationV1Api;
export type KubernetesObject = import("@kubernetes/client-node").KubernetesObject;
export type V1Lease = import("@kubernetes/client-node").V1Lease;
export type V1MicroTime = import("@kubernetes/client-node").V1MicroTime;
export type V1ObjectMeta = import("@kubernetes/client-node").V1ObjectMeta;
export type LeaderElectionRecord = {
    /**
     * The identity of the holder of a current
     * lease.
     */
    holderIdentity: string;
    /**
     * Duration that candidates for a lease
     * need to wait to force acquire it.
     */
    leaseDurationSeconds: number;
    /**
     * Time when the current lease was acquired.
     */
    acquireTime: V1MicroTime;
    /**
     * Time when the current holder of a lease
     * has last updated the lease.
     */
    renewTime: V1MicroTime;
    /**
     * The number of transitions of a lease
     * between holders.
     */
    leaderTransitions: number;
    /**
     * The strategy for picking the leader for
     * coordinated leader election.
     */
    strategy?: string;
    /**
     * Signals to a lease holder that the
     * lease has a more optimal holder and should be given up.
     */
    preferredHolder?: string;
};
export type recordEventFn = (object: KubernetesObject, eventType: string, reason: string, message: string) => void;
export type EventRecorder = {
    /**
     * Called to record individual events.
     */
    event: recordEventFn;
};
export type ResourceLockConfig = {
    /**
     * Unique string identifying a lease holder across
     * all participants in an election.
     */
    identity: string;
    /**
     * Used to record changes to the lock.
     */
    eventRecorder?: EventRecorder;
};
