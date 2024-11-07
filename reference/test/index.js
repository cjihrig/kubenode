'use strict';
const assert = require('node:assert');
const { test } = require('node:test');
const { parse } = require('../lib');

test('throws if input is not a string', () => {
  assert.throws(() => {
    parse();
  }, /TypeError: input must be a string/);
});

test('throws if repository has no components', () => {
  assert.throws(() => {
    parse('');
  }, /repository name must have at least one component/);
});

test('throws if repository name is not all lowercase', () => {
  assert.throws(() => {
    parse('LOCALHOST');
  }, /repository name must be lowercase/);
});

test('throws if repository name is invalid', () => {
  assert.throws(() => {
    parse(':::::');
  }, /invalid reference format/);
});

test('throws if repository name is too long', () => {
  assert.throws(() => {
    parse('x'.repeat(256));
  }, /RangeError: repository name must not be more than 255 characters/);
});

test('repository path only', () => {
  const r = parse('node');
  assert.deepStrictEqual(r, {
    namedRepository: { domain: undefined, path: 'node' },
    tag: undefined,
    digest: undefined
  });
});

test('repository domain and path', () => {
  const r = parse('localhost/node');
  assert.deepStrictEqual(r, {
    namedRepository: { domain: 'localhost', path: 'node' },
    tag: undefined,
    digest: undefined
  });
});

test('repository domain and multipart path', () => {
  const r = parse('localhost/node/node');
  assert.deepStrictEqual(r, {
    namedRepository: { domain: 'localhost', path: 'node/node' },
    tag: undefined,
    digest: undefined
  });
});

test('repository domain, port, and path', () => {
  const r = parse('localhost:5000/node');
  assert.deepStrictEqual(r, {
    namedRepository: { domain: 'localhost:5000', path: 'node' },
    tag: undefined,
    digest: undefined
  });
});

test('repository path and tag', () => {
  const r = parse('node:latest');
  assert.deepStrictEqual(r, {
    namedRepository: { domain: undefined, path: 'node' },
    tag: 'latest',
    digest: undefined
  });
});

test('reference with all components', () => {
  const r = parse('localhost:5000/controller:latest@sha256:cbbf2f9a99b47fc460d422812b6a5adff7dfee951d8fa2e4a98caa0382cfbdbf');
  assert.deepStrictEqual(r, {
    namedRepository: { domain: 'localhost:5000', path: 'controller' },
    tag: 'latest',
    digest: 'sha256:cbbf2f9a99b47fc460d422812b6a5adff7dfee951d8fa2e4a98caa0382cfbdbf'
  });
});
