import assert from 'node:assert';
import { suite, test } from 'node:test';
import { Builder } from '../lib/builder.js';
import { Controller } from '../lib/controller.js';
import { Manager } from '../lib/manager.js';
import { Reconciler } from '../lib/reconcile.js';
import { getManagerOptions } from './test-utils.js';

suite('Builder', () => {
  suite('Builder() constructor', () => {
    test('successfully constructs a Builder instance', () => {
      const manager = new Manager(getManagerOptions());
      const builder = new Builder(manager);

      assert.strictEqual(builder instanceof Builder, true);
    });

    test('throws if a Manager instance is not provided', () => {
      assert.throws(() => {
        new Builder({});
      }, /TypeError: manager must be a Manager instance/);
    });
  });

  suite('Builder.prototype.build()', () => {
    test('successfully builds after calling named()', () => {
      const manager = new Manager(getManagerOptions());
      const builder = new Builder(manager);
      const reconciler = new Reconciler();

      builder.named('foobar');
      const controller = builder.build(reconciler);
      assert.strictEqual(controller instanceof Controller, true);
      assert.strictEqual(controller.name, 'foobar');
    });

    test('successfully builds after calling for()', () => {
      const manager = new Manager(getManagerOptions());
      const builder = new Builder(manager);
      const reconciler = new Reconciler();

      builder.for('Foo', 'bar.com/v1');
      const controller = builder.build(reconciler);
      assert.strictEqual(controller instanceof Controller, true);
      assert.strictEqual(controller.name, 'foo');
    });

    test('throws if a Reconciler instance is not provided', () => {
      const manager = new Manager(getManagerOptions());
      const builder = new Builder(manager);

      assert.throws(() => {
        builder.build({});
      }, /TypeError: reconciler must be a Reconciler instance/);
    });

    test('throws if no controller name can be determined', () => {
      const manager = new Manager(getManagerOptions());
      const builder = new Builder(manager);
      const reconciler = new Reconciler();

      assert.throws(() => {
        builder.build(reconciler);
      }, /controller has no name\. for\(\) or named\(\) must be called/);
    });
  });

  suite('Builder.prototype.complete()', () => {
    test('successfully builds', (t) => {
      const manager = new Manager(getManagerOptions());
      const builder = new Builder(manager);
      const reconciler = new Reconciler();

      t.mock.method(builder, 'build');
      builder.named('foobar');
      assert.strictEqual(builder.build.mock.calls.length, 0);
      assert.strictEqual(builder.complete(reconciler), undefined);
      assert.strictEqual(builder.build.mock.calls.length, 1);
      assert.deepStrictEqual(builder.build.mock.calls[0].arguments, [
        reconciler
      ]);
    });
  });

  suite('Builder.prototype.for()', () => {
    test('can only be called once', () => {
      const manager = new Manager(getManagerOptions());
      const builder = new Builder(manager);

      builder.for('Foo', 'bar.com/v1');
      assert.throws(() => {
        builder.for('Foo', 'bar.com/v1');
      }, /for\(\) can only be called once/);
    });
  });

  suite('Builder.prototype.owns()', () => {
    test('is currently unimplemented', () => {
      const manager = new Manager(getManagerOptions());
      const builder = new Builder(manager);

      assert.throws(() => {
        builder.owns();
      }, /unimplemented/);
    });
  });

  suite('Builder.prototype.watches()', () => {
    test('is currently unimplemented', () => {
      const manager = new Manager(getManagerOptions());
      const builder = new Builder(manager);

      assert.throws(() => {
        builder.watches();
      }, /unimplemented/);
    });
  });

  suite('Builder.controllerManagedBy()', () => {
    test('creates a Builder', () => {
      const manager = new Manager(getManagerOptions());
      const builder = Builder.controllerManagedBy(manager);

      assert.strictEqual(builder instanceof Builder, true);
    });
  });
});
