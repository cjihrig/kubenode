export class Queue extends EventEmitter<[never]> {
    constructor();
    data: any[];
    enqueue(item: any): void;
    dequeue(): {
        data: any;
    };
}
import { EventEmitter } from "events";
