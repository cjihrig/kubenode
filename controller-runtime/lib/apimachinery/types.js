'use strict';
const kSeparator = '/';

/**
 * NamespacedName comprises a resource name and namespace rendered as "namespace/name".
 */
class NamespacedName {
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

module.exports = {
  NamespacedName,
  separator: kSeparator,
  JSONPatchType: 'application/json-patch+json',
  MergePatchType: 'application/merge-patch+json',
  StrategicMergePatchType: 'application/strategic-merge-patch+json',
  ApplyPatchType: 'application/apply-patch+yaml'
};
