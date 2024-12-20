export class Request extends NamespacedName {
}
export class Result {
    constructor(requeue: any);
    requeue: boolean;
    requeueAfter: number;
}
export class TerminalError extends Error {
    constructor(cause: any);
}
export class Reconciler {
    reconcile(context: any, request: any): Promise<void>;
}
declare namespace _default {
    export { Reconciler };
    export { Request };
    export { Result };
    export { TerminalError };
}
export default _default;
import { NamespacedName } from './apimachinery/types.js';
