'use strict';
const { createServer } = require('node:http');
const {
  AdmissionResponse,
  AdmissionReview,
  errored
} = require('./admission');
const kContentTypeHeader = 'content-type';
const kContentTypeValue = 'application/json';
const kDefaultPort = 9443;
// Limit request bodies to 7MB. This matches the Go implementation.
// Reasoning: https://github.com/kubernetes-sigs/controller-runtime/blob/834905b07c7b5a78e86d21d764f7c2fdaa9602e0/pkg/webhook/admission/http.go#L48-L52
const kMaxRequestSize = 7 * 1024 * 1024;
const kResponseHeaders = { [kContentTypeHeader]: kContentTypeValue };

/**
 * @typedef {Object} ServerOptions
 * @property {number} [port] The port number that the server will bind to.
 */

class Server {
  /**
   * Creates a new Server instance.
   * @param {ServerOptions} options Options used to construct instance.
   */
  constructor(options) {
    if (options === undefined) {
      options = {};
    }

    if (options === null || typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }

    const {
      port = kDefaultPort
    } = options;

    this.context = null;
    this.port = port;
    this.router = new Map();
    this.server = null;
  }

  /**
   * register() marks the given webhook as being served at the given path.
   * @param {string} path The path to serve the webhook from.
   * @param {Function} hook The webhook to serve.
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
   * @param {Object} ctx The context object.
   */
  start(ctx) {
    this.context = ctx;
    this.server = createServer(async (req, res) => {
      const hook = this.router.get(req.url);
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
        let response = hook(this.context, review.request);

        if (!(response instanceof AdmissionResponse)) {
          response = new AdmissionResponse(response);
        }

        response.complete(review.request);
        writeAdmissionResponse(res, response);
      } catch (err) {
        writeAdmissionResponse(res, errored(500));
      }
    });

    this.server.listen(this.port);
  }
}

function writeAdmissionResponse(res, response) {
  try {
    const review = new AdmissionReview({ response });
    const json = JSON.stringify(review);

    res.writeHead(200, kResponseHeaders).end(json);
  } catch (err) {
    res.writeHead(500).end();
  }
}

function readAdmissionReview(req) {
  // @ts-ignore
  const { promise, resolve, reject } = Promise.withResolvers();
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

module.exports = { Server };
