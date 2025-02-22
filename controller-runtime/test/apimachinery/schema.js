import assert from 'node:assert';
import { suite, test } from 'node:test';
import {
  GroupKind,
  GroupResource,
  GroupVersion,
  GroupVersionKind,
  GroupVersionResource,
} from '../../lib/apimachinery/schema.js';

suite('GroupKind', () => {
  test('GroupKind() constructor', () => {
    const gk = new GroupKind('foo', 'bar');
    assert.strictEqual(gk.group, 'foo');
    assert.strictEqual(gk.kind, 'bar');
  });

  test('GroupKind.prototype.withVersion()', () => {
    const gk = new GroupKind('foo', 'bar');
    const gvk = gk.withVersion('baz');

    assert.strictEqual(gvk instanceof GroupVersionKind, true);
    assert.strictEqual(gvk.group, 'foo');
    assert.strictEqual(gvk.version, 'baz');
    assert.strictEqual(gvk.kind, 'bar');
  });

  test('GroupKind.prototype.toString()', () => {
    assert.strictEqual(new GroupKind('foo', 'bar').toString(), 'bar.foo');
    assert.strictEqual(new GroupKind('', 'bar').toString(), 'bar');
  });

  test('GroupKind.fromString()', () => {
    let gk = GroupKind.fromString('Book');
    assert.strictEqual(gk instanceof GroupKind, true);
    assert.strictEqual(gk.group, '');
    assert.strictEqual(gk.kind, 'Book');

    gk = GroupKind.fromString('Book.foo.com');
    assert.strictEqual(gk instanceof GroupKind, true);
    assert.strictEqual(gk.group, 'foo.com');
    assert.strictEqual(gk.kind, 'Book');
  });
});

suite('GroupResource', () => {
  test('GroupResource() constructor', () => {
    const gr = new GroupResource('foo', 'bar');
    assert.strictEqual(gr.group, 'foo');
    assert.strictEqual(gr.resource, 'bar');
  });

  test('GroupResource.prototype.withVersion()', () => {
    const gr = new GroupResource('foo', 'bar');
    const gvr = gr.withVersion('baz');

    assert.strictEqual(gvr instanceof GroupVersionResource, true);
    assert.strictEqual(gvr.group, 'foo');
    assert.strictEqual(gvr.version, 'baz');
    assert.strictEqual(gvr.resource, 'bar');
  });

  test('GroupResource.prototype.toString()', () => {
    assert.strictEqual(new GroupResource('foo', 'bar').toString(), 'bar.foo');
    assert.strictEqual(new GroupResource('', 'bar').toString(), 'bar');
  });

  test('GroupResource.fromString()', () => {
    let gr = GroupResource.fromString('resourcename');
    assert.strictEqual(gr instanceof GroupResource, true);
    assert.strictEqual(gr.group, '');
    assert.strictEqual(gr.resource, 'resourcename');

    gr = GroupResource.fromString('resourcename.group.com');
    assert.strictEqual(gr instanceof GroupResource, true);
    assert.strictEqual(gr.group, 'group.com');
    assert.strictEqual(gr.resource, 'resourcename');
  });
});

suite('GroupVersion', () => {
  test('GroupVersion() constructor', () => {
    const gv = new GroupVersion('foo', 'bar');
    assert.strictEqual(gv.group, 'foo');
    assert.strictEqual(gv.version, 'bar');
  });

  test('GroupVersion.prototype.withKind()', () => {
    const gv = new GroupVersion('foo', 'bar');
    const gvk = gv.withKind('baz');

    assert.strictEqual(gvk instanceof GroupVersionKind, true);
    assert.strictEqual(gvk.group, 'foo');
    assert.strictEqual(gvk.version, 'bar');
    assert.strictEqual(gvk.kind, 'baz');
  });

  test('GroupVersion.prototype.withResource()', () => {
    const gv = new GroupVersion('foo', 'bar');
    const gvr = gv.withResource('baz');

    assert.strictEqual(gvr instanceof GroupVersionResource, true);
    assert.strictEqual(gvr.group, 'foo');
    assert.strictEqual(gvr.version, 'bar');
    assert.strictEqual(gvr.resource, 'baz');
  });

  test('GroupVersion.prototype.toString()', () => {
    assert.strictEqual(new GroupVersion('foo', 'bar').toString(), 'foo/bar');
    assert.strictEqual(new GroupVersion('', 'bar').toString(), 'bar');
  });

  test('GroupVersion.fromString()', () => {
    let gv = GroupVersion.fromString('v1');
    assert.strictEqual(gv instanceof GroupVersion, true);
    assert.strictEqual(gv.group, '');
    assert.strictEqual(gv.version, 'v1');

    gv = GroupVersion.fromString('foo.com/v1');
    assert.strictEqual(gv instanceof GroupVersion, true);
    assert.strictEqual(gv.group, 'foo.com');
    assert.strictEqual(gv.version, 'v1');

    assert.throws(() => {
      GroupVersion.fromString('//');
    }, /unexpected GroupVersion string/);
  });
});

suite('GroupVersionKind', () => {
  test('GroupVersionKind() constructor', () => {
    const gvk = new GroupVersionKind('foo', 'bar', 'baz');
    assert.strictEqual(gvk.group, 'foo');
    assert.strictEqual(gvk.version, 'bar');
    assert.strictEqual(gvk.kind, 'baz');
  });

  test('GroupVersionKind.prototype.toAPIVersion()', () => {
    assert.strictEqual(
      new GroupVersionKind('foo', 'bar').toAPIVersion(),
      'foo/bar'
    );
    assert.strictEqual(new GroupVersionKind('', 'bar').toAPIVersion(), 'bar');
  });

  test('GroupVersionKind.fromAPIVersionAndKind()', () => {
    let gvk = GroupVersionKind.fromAPIVersionAndKind('v1', 'Book');
    assert.strictEqual(gvk instanceof GroupVersionKind, true);
    assert.strictEqual(gvk.group, '');
    assert.strictEqual(gvk.version, 'v1');
    assert.strictEqual(gvk.kind, 'Book');

    gvk = GroupVersionKind.fromAPIVersionAndKind('foo.com/v1', 'Book');
    assert.strictEqual(gvk instanceof GroupVersionKind, true);
    assert.strictEqual(gvk.group, 'foo.com');
    assert.strictEqual(gvk.version, 'v1');
    assert.strictEqual(gvk.kind, 'Book');

    assert.throws(() => {
      GroupVersionKind.fromAPIVersionAndKind('//', 'Book');
    }, /unexpected GroupVersion string/);
  });

  test('GroupVersionKind.fromKubernetesObject()', () => {
    const gvk = GroupVersionKind.fromKubernetesObject({
      apiVersion: 'v1',
      kind: 'Foo'
    });
    assert.strictEqual(gvk instanceof GroupVersionKind, true);
    assert.strictEqual(gvk.group, '');
    assert.strictEqual(gvk.version, 'v1');
    assert.strictEqual(gvk.kind, 'Foo');

    assert.throws(() => {
      GroupVersionKind.fromKubernetesObject({ kind: 'Foo' });
    }, /object has no version/);

    assert.throws(() => {
      GroupVersionKind.fromKubernetesObject({ apiVersion: 'v1' });
    }, /object has no kind/);
  });
});

test('GroupVersionResource() constructor', () => {
  const gvr = new GroupVersionResource('foo', 'bar', 'baz');
  assert.strictEqual(gvr.group, 'foo');
  assert.strictEqual(gvr.version, 'bar');
  assert.strictEqual(gvr.resource, 'baz');
});
