export class Manager {
    constructor(options?: {});
    client: any;
    controllers: any[];
    kubeconfig: any;
    started: boolean;
    add(controller: any): void;
    start(context?: {
        client: any;
    }): void;
    #private;
}
