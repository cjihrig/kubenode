export class Controller {
    constructor(name: any, manager: any, options?: {});
    context: any;
    name: any;
    queue: Queue;
    reconciler: any;
    started: boolean;
    startWatches: any[];
    reconcile(context: any, request: any): any;
    start(context: any): void;
    watch(source: any): void;
    #private;
}
import { Queue } from "./queue";
