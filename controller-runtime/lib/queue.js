'use strict';
const { EventEmitter } = require('node:events');

class Queue extends EventEmitter {
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

module.exports = { Queue };
