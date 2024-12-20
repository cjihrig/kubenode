/**
 * NamespacedName comprises a resource name and namespace rendered as "namespace/name".
 */
export class NamespacedName {
    /**
     * Construct a NamespacedName.
     * @param {string} name - Resource name.
     * @param {string} [namespace] - Resource namespace.
     */
    constructor(name: string, namespace?: string);
    name: string;
    namespace: string;
    /**
     * Converts a NamespacedName to a string of the form "namespace/name".
     * @returns {string} A string representation of the NamespacedName.
     */
    toString(): string;
}
declare namespace _default {
    export { NamespacedName };
    export { kSeparator as separator };
    export { kJSONPatchType as JSONPatchType };
    export { kMergePatchType as MergePatchType };
    export { kStrategicMergePatchType as StrategicMergePatchType };
    export { kApplyPatchType as ApplyPatchType };
}
export default _default;
declare const kSeparator: "/";
declare const kJSONPatchType: "application/json-patch+json";
declare const kMergePatchType: "application/merge-patch+json";
declare const kStrategicMergePatchType: "application/strategic-merge-patch+json";
declare const kApplyPatchType: "application/apply-patch+yaml";
export { kSeparator as separator, kJSONPatchType as JSONPatchType, kMergePatchType as MergePatchType, kStrategicMergePatchType as StrategicMergePatchType, kApplyPatchType as ApplyPatchType };
