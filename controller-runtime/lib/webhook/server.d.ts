export type ServerOptions = {
    /**
     * The port number that the server will bind to.
     */
    port?: number;
};
/**
 * @typedef {Object} ServerOptions
 * @property {number} [port] The port number that the server will bind to.
 */
export class Server {
    /**
     * Creates a new Server instance.
     * @param {ServerOptions} options Options used to construct instance.
     */
    constructor(options: ServerOptions);
    context: any;
    port: number;
    router: Map<any, any>;
    server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
    /**
     * register() marks the given webhook as being served at the given path.
     * @param {string} path The path to serve the webhook from.
     * @param {Function} hook The webhook to serve.
     */
    register(path: string, hook: Function): void;
    /**
     * start() runs the server.
     * @param {Object} ctx The context object.
     */
    start(ctx: any): void;
}
