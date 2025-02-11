/**
 * GroupVersionResource unambiguously identifies a resource.
 */
export class GroupVersionResource {
    /**
     * Construct a GroupVersionResource.
     * @param {string} group - Resource group.
     * @param {string} version - Resource version.
     * @param {string} resource - Resource name.
     */
    constructor(group: string, version: string, resource: string);
    group: string;
    version: string;
    resource: string;
}
/**
 * GroupVersionKind unambiguously identifies a kind.
 */
export class GroupVersionKind {
    /**
     * fromAPIVersionAndKind() attempts to construct a GroupVersionKind instance
     * from the provided "group/version" and kind strings.
     * @param {string} apiVersion - String representation of a group and version.
     * @param {string} kind - Resource kind.
     * @returns {GroupVersionKind}
     */
    static fromAPIVersionAndKind(apiVersion: string, kind: string): GroupVersionKind;
    /**
     * Construct a GroupVersionKind.
     * @param {string} group - Resource group.
     * @param {string} version - Resource version.
     * @param {string} kind - Resource kind.
     */
    constructor(group: string, version: string, kind: string);
    group: string;
    version: string;
    kind: string;
    /**
     * toAPIVersion() returns a string representation of the group and version.
     * @returns {string}
     */
    toAPIVersion(): string;
}
/**
 * GroupVersion contains the "group" and the "version", which uniquely identifies the API.
 */
export class GroupVersion {
    /**
     * fromString() attempts to construct a GroupVersion instance from the
     * provided "group/version" string.
     * @param {string} gv - String representation of a group version.
     * @returns {GroupVersion}
     */
    static fromString(gv: string): GroupVersion;
    /**
     * Construct a GroupVersion.
     * @param {string} group - Resource group.
     * @param {string} version - Resource version.
     */
    constructor(group: string, version: string);
    group: string;
    version: string;
    /**
     * withKind() creates a GroupVersionKind based on the GroupVersion and Kind.
     * @param {string} kind - Resource kind.
     * @returns {GroupVersionKind}
     */
    withKind(kind: string): GroupVersionKind;
    /**
     * withResource() creates a GroupVersionResource based on the GroupVersion
     * and Resource.
     * @param {string} resource - Resource name.
     * @returns {GroupVersionResource}
     */
    withResource(resource: string): GroupVersionResource;
    /**
     * toString() returns a string representation of the GroupVersion. For the
     * legacy v1, it returns 'v1'.
     * @returns {string}
     */
    toString(): string;
}
/**
 * GroupKind specifies a Group and a Kind, but does not force a version.
 */
export class GroupKind {
    /**
     * fromString() attempts to construct a GroupKind instance from the provided
     * "kind.group" string.
     * @param {string} gk - String representation of a group kind.
     * @returns {GroupKind}
     */
    static fromString(gk: string): GroupKind;
    /**
     * Construct a GroupKind.
     * @param {string} group - Resource group.
     * @param {string} kind - Resource kind.
     */
    constructor(group: string, kind: string);
    group: string;
    kind: string;
    /**
     * withVersion() creates a GroupVersionKind based on the GroupKind and Version.
     * @param {string} version - Resource version.
     * @returns {GroupVersionKind}
     */
    withVersion(version: string): GroupVersionKind;
    /**
     * toString() returns a string representation of the GroupKind.
     * @returns {string}
     */
    toString(): string;
}
/**
 * GroupResource specifies a Group and a Resource, but does not force a version.
 */
export class GroupResource {
    /**
     * fromString() attempts to construct a GroupResource instance from the
     * provided "resource.group" string. Empty strings are allowed for both
     * fields.
     * @param {string} gr - String representation of a group resource.
     * @returns {GroupResource}
     */
    static fromString(gr: string): GroupResource;
    /**
     * Construct a GroupResource.
     * @param {string} group - Resource group.
     * @param {string} resource - Resource name.
     */
    constructor(group: string, resource: string);
    group: string;
    resource: string;
    /**
     * withVersion() creates a GroupVersionResource based on the GroupResource
     * and Version.
     * @param {string} version - Resource version.
     * @returns {GroupVersionResource}
     */
    withVersion(version: string): GroupVersionResource;
    /**
     * toString() returns a string representation of the GroupResource.
     * @returns {string}
     */
    toString(): string;
}
declare namespace _default {
    export { GroupKind };
    export { GroupVersion };
    export { GroupVersionKind };
    export { GroupVersionResource };
}
export default _default;
