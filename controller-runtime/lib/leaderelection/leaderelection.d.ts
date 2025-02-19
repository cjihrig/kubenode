/**
 * LeaderElector implements a leader election client.
 */
export class LeaderElector {
    /**
     * Construct a LeaderElector.
     * @param {LeaderElectionConfig} options - Leader election configuration
     * options.
     */
    constructor(options: LeaderElectionConfig);
    lock: LeaseLock;
    leaseDuration: number;
    renewDeadline: number;
    retryPeriod: number;
    callbacks: LeaderCallbacks;
    name: string;
    /** @type {LeaderElectionRecord} */
    record: LeaderElectionRecord;
    observedTime: number;
    leaseValidUntil: number;
    /**
     * run() starts the leader election loop.
     * @param {Context} ctx - The context to use.
     * @returns {Promise<void>}
     */
    run(ctx: Context): Promise<void>;
    /**
     * isLeader() returns true if the last observed leader was this client, and
     * false otherwise.
     * @returns {boolean}
     */
    isLeader(): boolean;
    /**
     * isLeaseValid() returns true if the lease is valid at the time provided,
     * and false otherwise.
     * @param {number} time - The time to check the lease against.
     * @returns {boolean}
     */
    isLeaseValid(time: number): boolean;
    #private;
}
declare namespace _default {
    export { LeaderElector };
}
export default _default;
export type LeaderElectionRecord = import("./leaselock.js").LeaderElectionRecord;
export type LeaderCallbacks = {
    /**
     * Called when the LeaderElector starts
     * leading.
     */
    onStartedLeading: () => void;
    /**
     * Called when the LeaderElector stops
     * leading. This is also called when the LeaderElector exits, even if it did
     * not start leading.
     */
    onStoppedLeading: () => void;
    /**
     * Called when the client
     * observes a leader that is not the previously observed leader. This includes
     * the first observed leader when the client starts.
     */
    onNewLeader: (identity: string) => void;
};
export type LeaderElectionConfig = {
    /**
     * The resource that will be used for locking.
     */
    lock: LeaseLock;
    /**
     * A client needs to wait a full leaseDuration
     * without observing a change to the record before it can attempt to take over.
     * When all clients are shutdown and a new set of clients are started with
     * different names against the same leader record, they must wait the full
     * leaseDuration before attempting to acquire the lease. Thus, leaseDuration
     * should be as short as possible (within your tolerance for clock skew rate)
     * to avoid possible long waits. leaseDuration is measured in milliseconds.
     */
    leaseDuration: number;
    /**
     * The number of milliseconds that the acting
     * leader will retry refreshing leadership before giving up.
     */
    renewDeadline: number;
    /**
     * The number of milliseconds the client should
     * wait between tries of actions.
     */
    retryPeriod: number;
    /**
     * Callbacks that are invoked at various
     * lifecycle events of the LeaderElector.
     */
    callbacks: LeaderCallbacks;
    /**
     * The name of the resource lock.
     */
    name: string;
};
import { LeaseLock } from './leaselock.js';
import { Context } from '../context.js';
