import assert from 'node:assert';
import { suite, test } from 'node:test';
import { Context } from '../../lib/context.js';
import admission from '../../lib/webhook/admission.js';
import { Server } from '../../lib/webhook/server.js';

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
    assert.strictEqual(ctx instanceof Context, true);
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

suite('Server.prototype.start()', () => {
  test('insecure server can be started', async (t) => {
    const s = new Server({ insecure: true, port: 0 });
    t.after(async () => {
      try {
        await s.stop();
      } catch {}
    });
    assert.strictEqual(s.started, false);
    await s.start(Context.create());
    assert.strictEqual(s.started, true);
  });

  test('throws if context is not a Context instance', async () => {
    const s = new Server({ insecure: true, port: 0 });

    await assert.rejects(async () => {
      await s.start(null);
    });
  });

  test('throws if the server is already started', async (t) => {
    const s = new Server({ insecure: true, port: 0 });
    t.after(async () => {
      try {
        await s.stop();
      } catch {}
    });
    await s.start(Context.create());
    await assert.rejects(async () => {
      await s.start(Context.create());
    }, /server already started/);
  });
});

suite('Server.prototype.stop()', () => {
  test('stops a running server', async (t) => {
    const s = new Server({ insecure: true, port: 0 });
    t.after(async () => {
      try {
        await s.stop();
      } catch {}
    });
    assert.strictEqual(s.started, false);
    await s.start(Context.create());
    assert.strictEqual(s.started, true);
    await s.stop();
    assert.strictEqual(s.started, false);
  });

  test('is a no-op if the server is already stopped', async () => {
    const s = new Server({ insecure: true, port: 0 });

    assert.strictEqual(s.started, false);
    await s.stop();
    assert.strictEqual(s.started, false);
    await s.stop();
    assert.strictEqual(s.started, false);
    await s.stop();
  });

  test('is called when the starting context is cancelled', async (t) => {
    const s = new Server({ insecure: true, port: 0 });
    t.after(async () => {
      try {
        await s.stop();
      } catch {}
    });

    t.mock.method(Server.prototype, 'stop');
    const ctx = Context.create();
    await s.start(ctx);
    assert.strictEqual(s.started, true);
    assert.strictEqual(s.stop.mock.callCount(), 0);
    ctx.cancel();
    await assert.rejects(ctx.done);
    assert.strictEqual(s.stop.mock.callCount(), 1);
  });
});
