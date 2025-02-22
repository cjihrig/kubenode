/**
 * EventRecorder records events of an event source.
 */
export class EventRecorder {
    /**
     * Construct an EventRecorder.
     * @param {V1EventSource} source - The recorder's EventSource.
     * @param {CoreV1Api} client - The client to create events with.
     */
    constructor(source: V1EventSource, client: CoreV1Api);
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
    event(object: KubernetesObject, eventType: string, reason: string, message: string): Promise<void>;
    #private;
}
declare namespace _default {
    export { EventRecorder };
}
export default _default;
export type CoreV1Api = import("@kubernetes/client-node").CoreV1Api;
export type KubernetesObject = import("@kubernetes/client-node").KubernetesObject;
export type V1EventSource = import("@kubernetes/client-node").V1EventSource;
export type V1ObjectReference = import("@kubernetes/client-node").V1ObjectReference;
