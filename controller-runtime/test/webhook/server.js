'use strict';
const assert = require('node:assert');
const { test } = require('node:test');
const admission = require('../../lib/webhook/admission');
const { Server } = require('../../lib/webhook/server');

test('Server() constructor options validation', () => {
  assert.throws(() => {
    // eslint-disable-next-line no-new
    new Server(null);
  }, /TypeError: options must be an object/);

  assert.throws(() => {
    // eslint-disable-next-line no-new
    new Server({ certDir: null });
  }, /TypeError: options.certDir must be a string/);

  assert.throws(() => {
    // eslint-disable-next-line no-new
    new Server({ certName: null });
  }, /TypeError: options.certName must be a string/);

  assert.throws(() => {
    // eslint-disable-next-line no-new
    new Server({ insecure: null });
  }, /TypeError: options.insecure must be a boolean/);

  assert.throws(() => {
    // eslint-disable-next-line no-new
    new Server({ keyName: null });
  }, /TypeError: options.keyName must be a string/);

  assert.throws(() => {
    // eslint-disable-next-line no-new
    new Server({ port: null });
  }, /TypeError: options.port must be a number/);
});

test('Server.p.register() options validation', () => {
  const s = new Server({ insecure: true });

  assert.throws(() => {
    s.register(null);
  }, /TypeError: path must be a string/);

  assert.throws(() => {
    s.register('', null);
  }, /TypeError: hook must be a function/);
});

test('Server.p.register() throws on duplicate paths', () => {
  const s = new Server({ insecure: true });

  s.register('/foo', () => {});
  assert.throws(() => {
    s.register('/foo', () => {});
  }, /Error: cannot register duplicate path: '\/foo'/);
});

test('Server.p.inject() injects a request', async () => {
  const s = new Server({ insecure: true });

  s.register('/foo', (ctx, req) => {
    assert.strictEqual(ctx, null);
    assert(req instanceof admission.AdmissionRequest);
    assert.strictEqual(req.uid, 'foobar');
    return admission.denied('test-deny');
  });
  const res = await s.inject({
    url: '/foo',
    headers: { 'content-type': 'application/json' },
    body: { request: { uid: 'foobar' } }
  });
  assert.deepStrictEqual(res, {
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: {
      apiVersion: 'admission.k8s.io/v1',
      kind: 'AdmissionReview',
      response: {
        uid: 'foobar',
        allowed: false,
        status: { code: 403, reason: 'Forbidden', message: 'test-deny' }
      }
    }
  });
});

test('returns a 404 if path is not registered', async () => {
  const s = new Server({ insecure: true });
  const res = await s.inject({
    url: '/foo',
    headers: { 'content-type': 'application/json' },
    body: { request: { uid: 'foobar' } }
  });
  assert.deepStrictEqual(res, { body: undefined, headers: {}, status: 404 });
});

test('denies request if content-type is wrong', async () => {
  const s = new Server({ insecure: true });
  s.register('/foo', (ctx, req) => { throw new Error('boom'); });
  const res = await s.inject({
    url: '/foo',
    headers: { 'content-type': 'text/html' },
    body: { request: { uid: 'foobar' } }
  });
  assert.deepStrictEqual(res, {
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: {
      apiVersion: 'admission.k8s.io/v1',
      kind: 'AdmissionReview',
      response: {
        allowed: false,
        status: { code: 400, message: 'received unexpected content-type' }
      }
    }
  });
});

test('denies requests larger than 7MB', async () => {
  const s = new Server({ insecure: true });
  s.register('/foo', (ctx, req) => { throw new Error('boom'); });
  const res = await s.inject({
    url: '/foo',
    headers: { 'content-type': 'application/json' },
    body: { request: { uid: 'x'.repeat(7 * 1024 * 1024) } }
  });
  assert.deepStrictEqual(res, {
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: {
      apiVersion: 'admission.k8s.io/v1',
      kind: 'AdmissionReview',
      response: {
        allowed: false,
        status: { code: 400, message: 'request exceeds maximum size' }
      }
    }
  });
});

test('denies request if response is invalid', async () => {
  const s = new Server({ insecure: true });
  s.register('/foo', (ctx, req) => { return 'invalid'; });
  const res = await s.inject({
    url: '/foo',
    headers: { 'content-type': 'application/json' },
    body: { request: { uid: 'foobar' } }
  });
  assert.deepStrictEqual(res, {
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: {
      apiVersion: 'admission.k8s.io/v1',
      kind: 'AdmissionReview',
      response: {
        allowed: false,
        status: { code: 500 }
      }
    }
  });
});

test('insecure server can be started', async (t) => {
  const s = new Server({ insecure: true, port: 0 });
  t.after(() => {
    try {
      s.server.close();
    } catch {}
  });
  await s.start();
});
