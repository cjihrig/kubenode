export class Server {
    constructor(options: any);
    groupList: any[];
    handlers: Map<any, any>;
    paths: string[];
    port: number;
    router: Map<any, any>;
    requestHandler: any;
    server: import("https").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
    register(api: any): void;
    start(): Promise<any>;
}
declare namespace _default {
    export { Server };
}
export default _default;
export type PromiseWithResolvers = {
    promise: Promise<any>;
    resolve: Function;
    reject: Function;
};
