import { EventEmitter } from 'node:events';

/**
 * @template T
 * @typedef {Object} QueueData
 * @property {T} data The data stored in the Queue.
 */

/**
 * A queue data structure.
 * @template T
 */
export class Queue extends EventEmitter {
  /**
   * Construct an empty Queue.
   */
  constructor() {
    super();
    /** @type T[] */
    this.data = [];
  }

  /**
   * enqueue() adds an item to the back of the Queue and causes a 'data' event
   * to be emitted.
   * @param {T} item - Item to insert into the Queue.
   */
  enqueue(item) {
    this.data.push(item);
    process.nextTick(() => {
      this.emit('data');
    });
  }

  /**
   * dequeue() adds an item to the back of the Queue and causes a 'data' event
   * @returns {QueueData<T>|undefined}
   */
  dequeue() {
    if (this.data.length === 0) {
      return undefined;
    }

    const data = this.data.shift();

    return { data };
  }
}

export default { Queue };
