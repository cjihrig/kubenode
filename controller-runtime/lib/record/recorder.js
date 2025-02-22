import { V1MicroTime } from '@kubernetes/client-node';
import { GroupVersionKind } from '../apimachinery/schema.js';

/**
 * @typedef {import('@kubernetes/client-node').CoreV1Api} CoreV1Api
 * @typedef {import('@kubernetes/client-node').KubernetesObject} KubernetesObject
 * @typedef {import('@kubernetes/client-node').V1EventSource} V1EventSource
 * @typedef {import('@kubernetes/client-node').V1ObjectReference} V1ObjectReference
 */

const kEventTypeNormal = 'Normal';
const kEventTypeWarning = 'Warning';

/**
 * EventRecorder records events of an event source.
 */
export class EventRecorder {
  /** @type CoreV1Api */
  #client;
  /** @type V1EventSource */
  #source;

  /**
   * Construct an EventRecorder.
   * @param {V1EventSource} source - The recorder's EventSource.
   * @param {CoreV1Api} client - The client to create events with.
   */
  constructor(source, client) {
    this.#client = client;
    this.#source = source;
  }

  /**
   * event() constructs an event from the given information and puts it in the
   * queue for sending. The resulting event will be created in the same
   * namespace as the reference object.
   * @param {KubernetesObject} object - The object this event is about.
   * @param {string} eventType - Can be 'Normal' or 'Warning'. New types could
   * be added in the future.
   * @param {string} reason - The reason the event was generated. The reason
   * should be short, unique, and written in UpperCamelCase.
   * @param {string} message - A human readable message.
   */
  async event(object, eventType, reason, message) {
    // TODO(cjihrig): This function should log errors instead of throwing.
    if (typeof eventType !== 'string') {
      throw new TypeError('eventType must be a string');
    }

    if (eventType !== kEventTypeNormal && eventType !== kEventTypeWarning) {
      throw new Error(`eventType must be '${kEventTypeNormal}' or '${kEventTypeWarning}'`);
    }

    if (typeof reason !== 'string') {
      throw new TypeError('reason must be a string');
    }

    if (typeof message !== 'string') {
      throw new TypeError('message must be a string');
    }

    const ref = getReference(object);
    const now = new Date();
    await this.#client.createNamespacedEvent({
      namespace: ref.namespace,
      body: {
        apiVersion: 'v1',
        kind: 'Event',
        metadata: {
          name: ref.name + process.hrtime().join(''),
          namespace: ref.namespace,
        },
        action: 'Added',
        count: 1,
        eventTime: new V1MicroTime(now.getTime()),
        firstTimestamp: now,
        lastTimestamp: now,
        involvedObject: ref,
        message,
        reason,
        reportingComponent: this.#source.host,
        reportingInstance: this.#source.component,
        source: this.#source,
        type: eventType,
      },
    }).catch(() => {});
  }
}

/**
 * getReference() returns a reference to the provided object.
 * @param {KubernetesObject} object - Kubernetes object.
 * @returns {V1ObjectReference}
 */
function getReference(object) {
  const gvk = GroupVersionKind.fromKubernetesObject(object);
  return {
    apiVersion: gvk.toAPIVersion(),
    kind: gvk.kind,
    name: object.metadata?.name,
    namespace: object.metadata?.namespace,
    resourceVersion: object.metadata?.resourceVersion,
    uid: object.metadata?.uid,
  };
}

export default {
  EventRecorder,
};
