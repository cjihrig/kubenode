import assert from 'node:assert';
import { test } from 'node:test';
import defaultExport, {
  k8s,
  apimachinery,
  controllerutil,
  Manager,
  newControllerManagedBy,
  Reconciler,
  Request,
  Result,
  Source,
  TerminalError,
  webhook
} from '../lib/index.js';

test('esm exports are configured properly', () => {
  assert.strictEqual(defaultExport.k8s, k8s);
  assert.strictEqual(defaultExport.apimachinery, apimachinery);
  assert.strictEqual(defaultExport.controllerutil, controllerutil);
  assert.strictEqual(defaultExport.Manager, Manager);
  assert.strictEqual(
    defaultExport.newControllerManagedBy, newControllerManagedBy
  );
  assert.strictEqual(defaultExport.Reconciler, Reconciler);
  assert.strictEqual(defaultExport.Request, Request);
  assert.strictEqual(defaultExport.Result, Result);
  assert.strictEqual(defaultExport.Source, Source);
  assert.strictEqual(defaultExport.TerminalError, TerminalError);
  assert.strictEqual(defaultExport.webhook, webhook);
});
