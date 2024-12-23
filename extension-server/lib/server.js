import { readFileSync } from 'node:fs';
import { createServer } from 'node:https';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { debuglog } from 'node:util';
let debug = debuglog('kubenode:extension_server', (fn) => {
  // @ts-ignore
  debug = fn;
});

const kDefaultCertName = 'tls.crt';
const kDefaultKeyName = 'tls.key';
const kDefaultPort = 9443;
const kMaxRequestTimeout = 10_000;

export class Server {
  constructor(options) {
    if (options === undefined) {
      options = {};
    }

    if (options === null || typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }

    const {
      certDir = join(tmpdir(), 'k8s-api-server', 'serving-certs'),
      certName = kDefaultCertName,
      keyName = kDefaultKeyName,
      port = kDefaultPort
    } = options;

    if (typeof certDir !== 'string') {
      throw new TypeError('options.certDir must be a string');
    }

    if (typeof certName !== 'string') {
      throw new TypeError('options.certName must be a string');
    }

    if (typeof keyName !== 'string') {
      throw new TypeError('options.keyName must be a string');
    }

    if (typeof port !== 'number') {
      throw new TypeError('options.port must be a number');
    }

    this.groupList = [];
    this.handlers = new Map();
    this.paths = ['/apis'];
    this.port = port;
    this.router = new Map();

    const serverOptions = {
      cert: readFileSync(join(certDir, certName)),
      key: readFileSync(join(certDir, keyName)),
      requestTimeout: kMaxRequestTimeout
    };

    this.requestHandler = requestHandler.bind(this);
    this.server = createServer(serverOptions, this.requestHandler);
  }

  register(api) {
    // TODO(cjihrig): Input validation.
    let group = this.groupList.find((g) => {
      return g.name === api.group;
    });
    if (group === undefined) {
      group = {
        name: api.group,
        versions: [],
        preferredVersion: {
          groupVersion: '',
          version: ''
        }
      };
      this.paths.push(`/apis/${api.group}`);
      this.groupList.push(group);
    }

    const groupVersion = `${api.group}/${api.version}`;
    let version = group.versions.find((v) => {
      return v.version === api.version;
    });
    if (version !== undefined) {
      throw new Error(`API '${groupVersion}' already exists`);
    }

    group.versions.push({ groupVersion, version: api.version });
    if (group.versions.length === 1) {
      group.preferredVersion.groupVersion = groupVersion;
      group.preferredVersion.version = api.version;
    }

    const resources = [];

    for (let i = 0; i < api.resources.length; ++i) {
      const r = api.resources[i];
      const verbs = Object.keys(r.handlers);
      const handlers = {};

      for (let j = 0; j < verbs.length; ++j) {
        const v = verbs[j];

        handlers[v] = r.handlers[v];
      }

      resources.push({
        kind: r.kind,
        name: r.name,
        singularName: r.singularName,
        namespaced: r.namespaced,
        verbs,
      });
      this.handlers.set(`${groupVersion}/${r.name}`, handlers);
    }

    this.paths.push(`/apis/${groupVersion}`);
    this.router.set('/', JSON.stringify({ paths: this.paths }));
    this.router.set('/apis', JSON.stringify({
      kind: 'APIGroupList',
      apiVersion: 'v1',
      groups: this.groupList
    }));
    this.router.set(`/apis/${api.group}`, JSON.stringify({
      kind: 'APIGroup',
      apiVersion: 'v1',
      ...group
    }));
    this.router.set(`/apis/${groupVersion}`, JSON.stringify({
      kind: 'APIResourceList',
      apiVersion: 'v1',
      groupVersion,
      resources
    }));
  }

  start() {
    const { promise, resolve, reject } = withResolvers();

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

async function requestHandler(req, res) {
  debug('received request: %s %s', req.method, req.url);
  const url = new URL(req.url, 'http://localhost');
  const cached = this.router.get(url.pathname);

  if (cached !== undefined) {
    res.writeHead(200, {}).end(cached);
    return;
  }

  const segments = url.pathname.split('/');

  // TODO(cjihrig): Support /openapi/v3 endpoint.

  if (segments[1] === 'apis') {
    const groupName = segments[2];
    const versionName = segments[3];
    // TODO(cjihrig): Handle namespaced vs. cluster scoped URLs.
    const resourceType = segments[4];
    const fullResource = `${groupName}/${versionName}/${resourceType}`;
    const handlers = this.handlers.get(fullResource);

    if (handlers !== undefined) {
      const resourceName = segments[5];
      let verb;

      // TODO(cjihrig): Support map other verbs.
      if (resourceName === undefined) {
        if (req.method === 'GET') {
          verb = 'list';
        }
      } else {
        if (req.method === 'GET') {
          verb = 'get';
        }
      }

      const handler = typeof verb === 'string' && handlers[verb];
      const supportsVerb = typeof handler === 'function';
      debug('request kubernetes verb: %s, supported=%s', verb, supportsVerb);
      if (supportsVerb) {
        handler(req, res);
        return;
      }
    }
  }

  res.writeHead(404).end();
}

/**
 * @typedef {Object} PromiseWithResolvers
 * @property {Promise} promise
 * @property {Function} resolve
 * @property {Function} reject
 */

/**
 * withResolvers() works like Promise.withResolvers().
 * @returns {PromiseWithResolvers}
 */
function withResolvers() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export default { Server };
