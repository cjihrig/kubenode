/**
 * Context carries deadlines, cancellation signals, and other values across API
 * boundaries.
 */
export class Context {
    static create(): Context;
    constructor(key: any, parent: any);
    cancel(): void;
    child(): Context;
    get done(): Promise<any>;
    get signal(): AbortSignal;
    get values(): Map<any, any>;
    #private;
}
declare namespace _default {
    export { Context };
}
export default _default;
export type PromiseWithResolvers = {
    promise: Promise<any>;
    resolve: Function;
    reject: Function;
};
