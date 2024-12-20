export class Queue extends EventEmitter<[never]> {
    constructor();
    data: any[];
    enqueue(item: any): void;
    dequeue(): {
        data: any;
    };
}
declare namespace _default {
    export { Queue };
}
export default _default;
import { EventEmitter } from 'node:events';
