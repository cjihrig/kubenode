import assert from 'node:assert';
import { test } from 'node:test';
import { parse } from '../lib/index.js';

test('parses a simple command successfully', (t) => {
  const spy = t.mock.fn();
  const root = {
    name: 'foo',
    run: spy,
  };
  const result = parse(root, ['bar', '--baz', 5]);
  assert.deepStrictEqual(result, {
    command: root,
    flags: { __proto__: null, baz: true },
    positionals: ['bar', 5],
  });
  assert.strictEqual(spy.mock.calls.length, 0);
  assert.strictEqual(result.command.run(), undefined);
  assert.strictEqual(spy.mock.calls.length, 1);
  const call = spy.mock.calls[0];
  assert.deepStrictEqual(call.arguments, []);
  assert.strictEqual(call.error, undefined);
  assert.strictEqual(call.result, undefined);
  assert.strictEqual(call.this, root);
});

test('throws usage if resolved command is not runnable', () => {
  const root = { name: 'foo' };
  assert.throws(() => {
    parse(root);
  }, (err) => {
    assert.match(err.message, /Usage:/);
    assert.match(err.message, /foo/);
    return true;
  });
});

test('parses a command with subcommands successfully', (t) => {
  const spy1 = t.mock.fn();
  const spy2 = t.mock.fn();
  const sub1 = { name: 'baz', run: spy1 };
  const sub2 = { name: 'bar', run: spy2 };
  const root = {
    name: 'foo',
    subcommands() {
      return new Map([
        [sub1.name, sub1],
        [sub2.name, sub2],
      ]);
    }
  };
  const result = parse(root, ['bar', '--baz', 5]);
  assert.deepStrictEqual(result, {
    command: sub2,
    flags: { __proto__: null, baz: true },
    positionals: ['bar', 5],
  });
  assert.strictEqual(spy2.mock.calls.length, 0);
  assert.strictEqual(result.command.run(), undefined);
  assert.strictEqual(spy2.mock.calls.length, 1);
  const call = spy2.mock.calls[0];
  assert.deepStrictEqual(call.arguments, []);
  assert.strictEqual(call.error, undefined);
  assert.strictEqual(call.result, undefined);
  assert.strictEqual(call.this, sub2);
  assert.strictEqual(spy1.mock.calls.length, 0);
});
