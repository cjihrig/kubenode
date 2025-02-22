import assert from 'node:assert';
import { suite, test } from 'node:test';
import { V1MicroTime } from '@kubernetes/client-node';
import { EventRecorder } from '../../lib/record/recorder.js';

function getEventSource() {
  return {
    host: 'test-host',
    component: 'test-component',
  };
}

function getClient(mock) {
  const store = new Map();

  return {
    store,
    createNamespacedEvent: mock.fn(async (o) => {
      const key = `${o.body.metadata.namespace}/${o.body.metadata.name}`;
      const val = o.body;

      store.set(key, val);
      return val;
    }),
  };
}

suite('EventRecorder', () => {
  suite('EventRecorder() constructor', () => {
    test('constructs an EventRecorder instance', (t) => {
      const rec = new EventRecorder(getEventSource(), getClient(t.mock));
      assert.strictEqual(rec instanceof EventRecorder, true);
    });
  });

  suite('EventRecorder.prototype.event()', () => {
    test('creates an event based on the arguments', async (t) => {
      const source = getEventSource();
      const client = getClient(t.mock);
      const rec = new EventRecorder(source, client);
      const subject = {
        apiVersion: 'foo.bar.com/v1',
        kind: 'Blah',
        metadata: {
          name: 'test-name',
          namespace: 'test-namespace',
          resourceVersion: '1360334',
          uid: '01defbd3-4900-4665-bc5c-9b294988b326',
        },
      };
      const r = await rec.event(subject, 'Warning', 'Custom', 'hello there');

      assert.strictEqual(r, undefined);
      assert.strictEqual(client.createNamespacedEvent.mock.calls.length, 1);
      const arg = client.createNamespacedEvent.mock.calls[0].arguments[0];
      assert.strictEqual(arg.namespace, subject.metadata.namespace);
      assert.strictEqual(arg.body.apiVersion, 'v1');
      assert.strictEqual(arg.body.kind, 'Event');
      assert.match(arg.body.metadata.name, /test-name\d+/);
      assert.strictEqual(
        arg.body.metadata.namespace, subject.metadata.namespace
      );
      assert.strictEqual(arg.body.action, 'Added');
      assert.strictEqual(arg.body.count, 1);
      assert.strictEqual(arg.body.eventTime instanceof V1MicroTime, true);
      assert.strictEqual(arg.body.firstTimestamp instanceof Date, true);
      assert.strictEqual(arg.body.firstTimestamp, arg.body.lastTimestamp);
      assert.strictEqual(arg.body.message, 'hello there');
      assert.strictEqual(arg.body.reason, 'Custom');
      assert.strictEqual(arg.body.reportingComponent, source.host);
      assert.strictEqual(arg.body.reportingInstance, source.component);
      assert.strictEqual(arg.body.source, source);
      assert.strictEqual(arg.body.type, 'Warning');
      assert.deepStrictEqual(arg.body.involvedObject, {
        apiVersion: subject.apiVersion,
        kind: subject.kind,
        name: subject.metadata.name,
        namespace: subject.metadata.namespace,
        resourceVersion: subject.metadata.resourceVersion,
        uid: subject.metadata.uid,
      });
    });
  });
});
