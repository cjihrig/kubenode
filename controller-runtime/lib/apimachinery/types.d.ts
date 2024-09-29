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
declare const kSeparator: "/";
export declare let JSONPatchType: string;
export declare let MergePatchType: string;
export declare let StrategicMergePatchType: string;
export declare let ApplyPatchType: string;
export { kSeparator as separator };
