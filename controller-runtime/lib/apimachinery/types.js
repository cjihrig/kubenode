const kSeparator = '/';
const kJSONPatchType = 'application/json-patch+json';
const kMergePatchType = 'application/merge-patch+json';
const kStrategicMergePatchType = 'application/strategic-merge-patch+json';
const kApplyPatchType = 'application/apply-patch+yaml';

/**
 * NamespacedName comprises a resource name and namespace rendered as "namespace/name".
 */
export class NamespacedName {
  /**
   * Construct a NamespacedName.
   * @param {string} name - Resource name.
   * @param {string} [namespace] - Resource namespace.
   */
  constructor(name, namespace = '') {
    this.name = name;
    this.namespace = namespace;
  }

  /**
   * Converts a NamespacedName to a string of the form "namespace/name".
   * @returns {string} A string representation of the NamespacedName.
   */
  toString() {
    return `${this.namespace}${kSeparator}${this.name}`;
  }
}

export {
  kSeparator as separator,
  kJSONPatchType as JSONPatchType,
  kMergePatchType as MergePatchType,
  kStrategicMergePatchType as StrategicMergePatchType,
  kApplyPatchType as ApplyPatchType
};

export default {
  NamespacedName,
  separator: kSeparator,
  JSONPatchType: kJSONPatchType,
  MergePatchType: kMergePatchType,
  StrategicMergePatchType: kStrategicMergePatchType,
  ApplyPatchType: kApplyPatchType
};
