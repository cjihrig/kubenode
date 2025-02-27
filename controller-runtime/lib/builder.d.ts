export class Builder {
    static controllerManagedBy(manager: any): Builder;
    constructor(manager: any);
    manager: any;
    name: string;
    forInput: {
        kind: any;
        apiVersion: any;
    };
    ownsInput: any[];
    build(reconciler: any): Controller;
    complete(reconciler: any): void;
    for(kind: any, apiVersion: any): this;
    named(name: any): this;
    owns(kind: any, apiVersion: any): this;
    watches(): this;
    #private;
}
declare namespace _default {
    export { Builder };
}
export default _default;
import { Controller } from './controller.js';
