export class Reconciler {
    reconcile(context: any, request: any): Promise<void>;
}
declare const Request_base: {
    new (name: string, namespace?: string): {
        name: string;
        namespace: string;
        toString(): string;
    };
};
export class Request extends Request_base {
}
export class Result {
    constructor(requeue: any);
    requeue: boolean;
    requeueAfter: number;
}
export class TerminalError extends Error {
    constructor(cause: any);
}
export {};
