'use strict';
const assert = require('node:assert');
const { join } = require('node:path');
const { test } = require('node:test');
const crdgen = require('..');
const fixturesDir = join(__dirname, '..', 'fixtures');

test('extracts model from TypeScript source', () => {
  const fixture = join(fixturesDir, 'book.ts');
  const models = crdgen.generateModelsFromFiles([fixture]);

  assert.strictEqual(models.size, 1);
  const model = models.get('Book');
  assert.strictEqual(typeof model, 'object');
  assert.strictEqual(model.group, 'library.io');
  assert.strictEqual(model.version, 'v1');
  assert.strictEqual(model.kind, 'Book');
  assert.strictEqual(model.listKind, 'BookList');
  assert.strictEqual(model.singular, 'book');
  assert.strictEqual(model.plural, 'books');
  assert.strictEqual(model.description, 'Schema for the books API');
  assert.strictEqual(model.isNamespaced, false);
});

test('converts to CRD object format', () => {
  const fixture = join(fixturesDir, 'book.ts');
  const models = crdgen.generateModelsFromFiles([fixture]);
  const crd = models.get('Book').toCRD();
  const crdWithoutUndefineds = sanitizeObject(crd);

  assert.deepStrictEqual(crdWithoutUndefineds, {
    apiVersion: 'apiextensions.k8s.io/v1',
    kind: 'CustomResourceDefinition',
    metadata: {
      'name': 'books.library.io'
    },
    spec: {
      group: 'library.io',
      names: {
        kind: 'Book',
        listKind: 'BookList',
        plural: 'books',
        singular: 'book'
      },
      scope: 'Cluster',
      versions: [
        {
          name: 'v1',
          schema: {
            openAPIV3Schema: {
              description: 'Schema for the books API',
              properties: {
                apiVersion: {
                  description: 'apiVersion defines the versioned schema of this representation\nof an object. Servers should convert recognized schemas to the latest\ninternal value, and may reject unrecognized values.',
                  type: 'string'
                },
                kind: {
                  description: 'kind is a string value representing the REST resource this\nobject represents.',
                  type: 'string'
                },
                metadata: {
                  description: 'metadata is a standard Kubernetes object for metadata.',
                  type: 'object'
                },
                spec: {
                  description: 'spec defines the desired state of Book.',
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string'
                    }
                  }
                }
              },
              type: 'object'
            }
          },
          served: true,
          storage: true,
          subresources: {
            status: {}
          }
        }
      ]
    }
  });
});

test('supported types', () => {
  const fixture = join(fixturesDir, 'supported-types.ts');
  const models = crdgen.generateModelsFromFiles([fixture]);
  const crd = models.get('SupportedTypes').toCRD();
  const rawSchema = crd.spec.versions[0].schema.openAPIV3Schema.properties;
  const schema = sanitizeObject(rawSchema);

  assert.deepStrictEqual(schema.prop1, { type: 'string' });
  assert.deepStrictEqual(schema.prop2, { type: 'number' });
  assert.deepStrictEqual(schema.prop3, { type: 'boolean' });
  assert.deepStrictEqual(schema.prop4, { type: 'object' });
  assert.deepStrictEqual(schema.prop5, {
    type: 'array',
    items: { type: 'string' }
  });
  assert.deepStrictEqual(schema.prop6, { type: 'string' });
  assert.deepStrictEqual(schema.prop7, { type: 'boolean' });
  assert.deepStrictEqual(schema.prop8, { type: 'boolean' });
  assert.deepStrictEqual(schema.prop9, { type: 'number' });
  assert.deepStrictEqual(schema.prop10, {
    type: 'object',
    properties: { subprop: { type: 'string' } }
  });
  assert.deepStrictEqual(schema.prop11, {
    type: 'object',
    properties: { prop1: { type: 'boolean' } }
  });
  assert.deepStrictEqual(schema.prop12, {
    type: 'object',
    properties: { prop1: { type: 'boolean' } }
  });
  assert.deepStrictEqual(schema.prop13, {
    type: 'array',
    items: {
      type: 'object',
      properties: { prop1: { type: 'boolean' } }
    }
  });
  assert.deepStrictEqual(schema.prop14, {
    type: 'array',
    items: {
      type: 'object',
      properties: { prop1: { type: 'boolean' } }
    }
  });
  assert.deepStrictEqual(schema.prop15, {
    type: 'object',
    properties: {}
  });
});

test('method types', () => {
  const fixture = join(fixturesDir, 'functions.ts');
  const models = crdgen.generateModelsFromFiles([fixture]);
  const crd = models.get('FunctionMethod').toCRD();
  const rawSchema = crd.spec.versions[0].schema.openAPIV3Schema.properties;
  const schema = sanitizeObject(rawSchema);

  assert.deepStrictEqual(schema, { prop0: { type: 'string' } });
});

test('throws on unsupported data types', () => {
  const fixture = join(fixturesDir, 'unsupported-types.ts');
  const models = crdgen.generateModelsFromFiles([fixture]);

  assert.throws(() => {
    models.get('UndefinedPrimitive').toCRD();
  }, /data type 'undefined' is not supported/);

  assert.throws(() => {
    models.get('NullPrimitive').toCRD();
  }, /data type 'null' is not supported/);

  assert.throws(() => {
    models.get('SymbolPrimitive').toCRD();
  }, /data type 'symbol' is not supported/);

  assert.throws(() => {
    models.get('BigIntPrimitive').toCRD();
  }, /data type 'bigint' is not supported/);

  assert.throws(() => {
    models.get('FunctionObject').toCRD();
  }, /data type 'Function' is not supported/);

  assert.throws(() => {
    models.get('ArrayOfFunctionObjects').toCRD();
  }, /data type 'Function\[\]' is not supported/);
});

function sanitizeObject(obj) {
  return JSON.parse(JSON.stringify(obj, replacer));
}

function replacer(key, value) {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replaceAll('\r\n', '\n');
}
