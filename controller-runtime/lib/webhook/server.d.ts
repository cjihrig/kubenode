/**
 * @typedef {Object} ServerOptions
 * @property {string} [certDir] The directory that contains the server key and certificate.
 * @property {string} [certName] The server certificate name. Defaults to tls.crt.
 * @property {boolean} [insecure] If true, the server uses HTTP instead of HTTPS.
 * @property {string} [keyName] The server key name. Defaults to tls.key.
 * @property {number} [port] The port number that the server will bind to.
 */
/**
 * Server is a generic Kubernetes webhook server.
 */
export class Server {
    /**
     * Creates a new Server instance.
     * @param {ServerOptions} [options] Options used to construct instance.
     */
    constructor(options?: ServerOptions);
    /**
     * inject() creates a simulated request in the server.
     * @param {Object} settings Simulated request configuration.
     * @returns {Promise}
     */
    inject(settings: any): Promise<any>;
    /**
     * register() marks the given webhook as being served at the given path.
     * @param {string} path The path to serve the webhook from.
     * @param {function} hook The webhook to serve.
     */
    register(path: string, hook: Function): void;
    /**
     * start() runs the server.
     * @param {Context} context The context object.
     * @returns {Promise<void>}
     */
    start(context: Context): Promise<void>;
    /**
     * A boolean indicating if the manager was started.
     * @type {boolean}
     */
    get started(): boolean;
    /**
     * stop() causes the server to stop listening for connections. If the server
     * was already stopped, this is a no-op.
     * @returns {Promise<void>}
     */
    stop(): Promise<void>;
    #private;
}
declare namespace _default {
    export { Server };
}
export default _default;
export type RequestListener = import("node:http").RequestListener;
export type IncomingMessage = import("node:http").IncomingMessage;
export type InsecureServer = import("node:http").Server;
export type ServerResponse = import("node:http").ServerResponse;
export type SecureServer = import("node:https").Server;
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
import { Context } from '../context.js';
