export type ServerOptions = {
    /**
     * The directory that contains the server key and certificate.
     */
    certDir?: string;
    /**
     * The server certificate name. Defaults to tls.crt.
     */
    certName?: string;
    /**
     * If true, the server uses HTTP instead of HTTPS.
     */
    insecure?: boolean;
    /**
     * The server key name. Defaults to tls.key.
     */
    keyName?: string;
    /**
     * The port number that the server will bind to.
     */
    port?: number;
};
/**
 * @typedef {Object} ServerOptions
 * @property {string} [certDir] The directory that contains the server key and certificate.
 * @property {string} [certName] The server certificate name. Defaults to tls.crt.
 * @property {boolean} [insecure] If true, the server uses HTTP instead of HTTPS.
 * @property {string} [keyName] The server key name. Defaults to tls.key.
 * @property {number} [port] The port number that the server will bind to.
 */
export class Server {
    /**
     * Creates a new Server instance.
     * @param {ServerOptions} [options] Options used to construct instance.
     */
    constructor(options?: ServerOptions);
    context: any;
    port: number;
    requestHandler: any;
    router: Map<any, any>;
    server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | import("https").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
    /**
     * inject() creates a simulated request in the server.
     * @param {Object} settings Simulated request configuration.
     * @returns {Promise}
     */
    inject(settings: any): Promise<any>;
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
