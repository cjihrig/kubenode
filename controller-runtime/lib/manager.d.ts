export class Manager {
    constructor(options?: {});
    client: any;
    controllers: any[];
    kubeconfig: any;
    started: boolean;
    webhookServer: import("./webhook/server").Server;
    add(controller: any): void;
    getWebhookServer(): import("./webhook/server").Server;
    start(context?: {
        client: any;
    }): Promise<void>;
    #private;
}
