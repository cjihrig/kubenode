export class Manager {
    constructor(options?: {});
    client: any;
    controllers: any[];
    kubeconfig: any;
    started: boolean;
    webhookServer: Server;
    add(controller: any): void;
    getWebhookServer(): Server;
    start(context?: {
        client: any;
    }): Promise<void>;
    #private;
}
declare namespace _default {
    export { Manager };
}
export default _default;
import { Server } from './webhook/server.js';
