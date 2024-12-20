import { EventEmitter } from 'node:events';

export class Queue extends EventEmitter {
  constructor() {
    super();
    this.data = [];
  }

  enqueue(item) {
    this.data.push(item);
    process.nextTick(() => {
      this.emit('data');
    });
  }

  dequeue() {
    if (this.data.length === 0) {
      return undefined;
    }

    const data = this.data.shift();

    return { data };
  }
}

export default { Queue };
