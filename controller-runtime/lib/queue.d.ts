/**
 * @template T
 * @typedef {Object} QueueData
 * @property {T} data The data stored in the Queue.
 */
/**
 * A queue data structure.
 * @template T
 */
export class Queue<T> extends EventEmitter<[never]> {
    /**
     * Construct an empty Queue.
     */
    constructor();
    /** @type T[] */
    data: T[];
    /**
     * enqueue() adds an item to the back of the Queue and causes a 'data' event
     * to be emitted.
     * @param {T} item - Item to insert into the Queue.
     */
    enqueue(item: T): void;
    /**
     * dequeue() adds an item to the back of the Queue and causes a 'data' event
     * @returns {QueueData<T>|undefined}
     */
    dequeue(): QueueData<T> | undefined;
}
declare namespace _default {
    export { Queue };
}
export default _default;
export type QueueData<T> = {
    /**
     * The data stored in the Queue.
     */
    data: T;
};
import { EventEmitter } from 'node:events';
