import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { createServer as createSecureServer } from 'node:https';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  AdmissionResponse,
  AdmissionReview,
  errored
} from './admission.js';
import { Context } from '../context.js';
import { withResolvers } from '../util.js';

/**
 * @typedef {import('node:http').RequestListener} RequestListener
 * @typedef {import('node:http').IncomingMessage} IncomingMessage
 * @typedef {import('node:http').ServerResponse} ServerResponse
 */

const kContentTypeHeader = 'content-type';
const kContentTypeValue = 'application/json';
const kDefaultCertName = 'tls.crt';
const kDefaultKeyName = 'tls.key';
const kDefaultPort = 9443;
// Limit request bodies to 7MB. This matches the Go implementation.
// Reasoning: https://github.com/kubernetes-sigs/controller-runtime/blob/834905b07c7b5a78e86d21d764f7c2fdaa9602e0/pkg/webhook/admission/http.go#L48-L52
const kMaxRequestSize = 7 * 1024 * 1024;
const kMaxRequestTimeout = 10_000;  // 10 seconds is the Kubernetes default.
const kResponseHeaders = { [kContentTypeHeader]: kContentTypeValue };

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
  constructor(options) {
    if (options === undefined) {
      options = {};
    } else if (options === null || typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }

    const {
      certDir = join(tmpdir(), 'k8s-webhook-server', 'serving-certs'),
      certName = kDefaultCertName,
      insecure = false,
      keyName = kDefaultKeyName,
      port = kDefaultPort
    } = options;

    if (typeof certDir !== 'string') {
      throw new TypeError('options.certDir must be a string');
    }

    if (typeof certName !== 'string') {
      throw new TypeError('options.certName must be a string');
    }

    if (typeof insecure !== 'boolean') {
      throw new TypeError('options.insecure must be a boolean');
    }

    if (typeof keyName !== 'string') {
      throw new TypeError('options.keyName must be a string');
    }

    if (typeof port !== 'number') {
      throw new TypeError('options.port must be a number');
    }

    this.context = null;
    this.port = port;
    /** @type RequestListener */
    this.requestHandler = requestHandler.bind(this);
    /** @type Map<string, function> */
    this.router = new Map();

    if (insecure) {
      // Insecure servers are useful for local testing, but cannot be used in a
      // Kubernetes cluster because webhooks must use HTTPS.
      const serverOptions = { requestTimeout: kMaxRequestTimeout };
      this.server = createServer(serverOptions, this.requestHandler);
    } else {
      const serverOptions = {
        cert: readFileSync(join(certDir, certName)),
        key: readFileSync(join(certDir, keyName)),
        requestTimeout: kMaxRequestTimeout
      };
      this.server = createSecureServer(serverOptions, this.requestHandler);
    }
  }

  /**
   * inject() creates a simulated request in the server.
   * @param {Object} settings Simulated request configuration.
   * @returns {Promise}
   */
  inject(settings) {
    const { promise, resolve } = withResolvers();
    const response = {
      body: undefined,
      headers: {},
      status: -1
    };
    const req = new Readable({
      read() {
        if (settings.body) {
          this.push(JSON.stringify(settings.body));
        }

        this.push(null);
      }
    });
    const res = {
      end(str) {
        if (str) {
          response.body = JSON.parse(str);
        }

        resolve(response);
      },
      writeHead(status, headers) {
        response.status = status;

        if (headers) {
          response.headers = headers;
        }

        return this;
      }
    };

    // @ts-ignore
    req.url = settings.url;
    // @ts-ignore
    req.headers = settings.headers ?? {};
    // @ts-ignore
    this.requestHandler(req, res);

    return promise;
  }

  /**
   * register() marks the given webhook as being served at the given path.
   * @param {string} path The path to serve the webhook from.
   * @param {function} hook The webhook to serve.
   */
  register(path, hook) {
    if (typeof path !== 'string') {
      throw new TypeError('path must be a string');
    }

    if (typeof hook !== 'function') {
      throw new TypeError('hook must be a function');
    }

    if (this.router.has(path)) {
      throw new Error(`cannot register duplicate path: '${path}'`);
    }

    this.router.set(path, hook);
  }

  /**
   * start() runs the server.
   * @param {Context} ctx The context object.
   * @returns {Promise<void>}
   */
  start(ctx) {
    const { promise, resolve, reject } = withResolvers();

    this.context = ctx;
    this.server.listen(this.port, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
    return promise;
  }
}

/**
 * requestHandler() handles an individual HTTP request.
 * @this {Server}
 * @param {IncomingMessage} req The HTTP request object.
 * @param {ServerResponse} res The HTTP response object.
 * @returns {Promise<void>}
 */
async function requestHandler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const hook = this.router.get(url.pathname);
  if (hook === undefined) {
    res.writeHead(404).end();
    return;
  }

  let review;

  try {
    if (req.headers[kContentTypeHeader] !== kContentTypeValue) {
      throw new Error('received unexpected content-type');
    }

    review = await readAdmissionReview(req);
  } catch (err) {
    return writeAdmissionResponse(res, errored(400, err));
  }

  try {
    const ctx = this.context ? this.context.child() : Context.create();
    let response = hook(ctx, review.request);

    if (!(response instanceof AdmissionResponse)) {
      response = new AdmissionResponse(response);
    }

    response.complete(review.request);
    writeAdmissionResponse(res, response);
  } catch (err) {
    writeAdmissionResponse(res, errored(500));
  }
}

/**
 * writeAdmissionResponse() writes an Admission response to the response object.
 * @param {ServerResponse} res The HTTP response object.
 * @param {AdmissionResponse} response The Admission response.
 */
function writeAdmissionResponse(res, response) {
  try {
    const review = new AdmissionReview({ response });
    const json = JSON.stringify(review);

    res.writeHead(200, kResponseHeaders).end(json);
  } catch (err) {
    res.writeHead(500).end();
  }
}

/**
 * readAdmissionReview() reads an Admission review from the request object.
 * @param {IncomingMessage} req The HTTP request object.
 * @returns {Promise<AdmissionReview>}
 */
function readAdmissionReview(req) {
  const { promise, resolve, reject } = withResolvers();
  let body = '';

  req.setEncoding('utf8');
  req.once('error', (err) => {
    reject(err);
  });

  req.once('end', () => {
    try {
      resolve(new AdmissionReview(JSON.parse(body)));
    } catch (err) {
      reject(err);
    }
  });

  req.on('data', (chunk) => {
    body += chunk;

    if (body.length > kMaxRequestSize) {
      req.emit('error', new Error('request exceeds maximum size'));
    }
  });

  return promise;
}

export default { Server };
