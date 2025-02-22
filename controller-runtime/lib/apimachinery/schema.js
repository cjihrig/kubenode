/**
 * @typedef {import('@kubernetes/client-node').KubernetesObject} KubernetesObject
 */

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
  constructor(group, version, resource) {
    this.group = group;
    this.version = version;
    this.resource = resource;
  }
}

/**
 * GroupVersionKind unambiguously identifies a kind.
 */
export class GroupVersionKind {
  /**
   * Construct a GroupVersionKind.
   * @param {string} group - Resource group.
   * @param {string} version - Resource version.
   * @param {string} kind - Resource kind.
   */
  constructor(group, version, kind) {
    this.group = group;
    this.version = version;
    this.kind = kind;
  }

  /**
   * toAPIVersion() returns a string representation of the group and version.
   * @returns {string}
   */
  toAPIVersion() {
    return GroupVersion.prototype.toString.call(this);
  }

  /**
   * fromAPIVersionAndKind() attempts to construct a GroupVersionKind instance
   * from the provided "group/version" and kind strings.
   * @param {string} apiVersion - String representation of a group and version.
   * @param {string} kind - Resource kind.
   * @returns {GroupVersionKind}
   */
  static fromAPIVersionAndKind(apiVersion, kind) {
    const gv = GroupVersion.fromString(apiVersion);
    return new GroupVersionKind(gv.group, gv.version, kind);
  }

  /**
   * fromKubernetesObject() returns a GroupVersionKind based on the provided
   * object.
   * @param {KubernetesObject} object - Kubernetes object.
   * @returns {GroupVersionKind}
   */
  static fromKubernetesObject(object) {
    if (!object.kind) {
      throw new Error('object has no kind');
    }

    if (!object.apiVersion) {
      throw new Error('object has no version');
    }

    return this.fromAPIVersionAndKind(object.apiVersion, object.kind);
  }
}

/**
 * GroupVersion contains the "group" and the "version", which uniquely identifies the API.
 */
export class GroupVersion {
  /**
   * Construct a GroupVersion.
   * @param {string} group - Resource group.
   * @param {string} version - Resource version.
   */
  constructor(group, version) {
    this.group = group;
    this.version = version;
  }

  /**
   * withKind() creates a GroupVersionKind based on the GroupVersion and Kind.
   * @param {string} kind - Resource kind.
   * @returns {GroupVersionKind}
   */
  withKind(kind) {
    return new GroupVersionKind(this.group, this.version, kind);
  }

  /**
   * withResource() creates a GroupVersionResource based on the GroupVersion
   * and Resource.
   * @param {string} resource - Resource name.
   * @returns {GroupVersionResource}
   */
  withResource(resource) {
    return new GroupVersionResource(this.group, this.version, resource);
  }

  /**
   * toString() returns a string representation of the GroupVersion. For the
   * legacy v1, it returns 'v1'.
   * @returns {string}
   */
  toString() {
    if (this.group === '') {
      return this.version;
    }

    return `${this.group}/${this.version}`;
  }

  /**
   * fromString() attempts to construct a GroupVersion instance from the
   * provided "group/version" string.
   * @param {string} gv - String representation of a group version.
   * @returns {GroupVersion}
   */
  static fromString(gv) {
    const parts = gv.split('/');

    if (parts.length === 1) {
      return new GroupVersion('', gv);
    } else if (parts.length === 2) {
      return new GroupVersion(parts[0], parts[1]);
    } else {
      throw new Error('unexpected GroupVersion string: ' + gv);
    }
  }
}

/**
 * GroupKind specifies a Group and a Kind, but does not force a version.
 */
export class GroupKind {
  /**
   * Construct a GroupKind.
   * @param {string} group - Resource group.
   * @param {string} kind - Resource kind.
   */
  constructor(group, kind) {
    this.group = group;
    this.kind = kind;
  }

  /**
   * withVersion() creates a GroupVersionKind based on the GroupKind and Version.
   * @param {string} version - Resource version.
   * @returns {GroupVersionKind}
   */
  withVersion(version) {
    return new GroupVersionKind(this.group, version, this.kind);
  }

  /**
   * toString() returns a string representation of the GroupKind.
   * @returns {string}
   */
  toString() {
    if (this.group === '') {
      return this.kind;
    }

    return `${this.kind}.${this.group}`;
  }

  /**
   * fromString() attempts to construct a GroupKind instance from the provided
   * "kind.group" string.
   * @param {string} gk - String representation of a group kind.
   * @returns {GroupKind}
   */
  static fromString(gk) {
    const index = gk.indexOf('.');

    if (index === -1) {
      return new GroupKind('', gk);
    }

    return new GroupKind(gk.substring(index + 1), gk.substring(0, index));
  }
}

/**
 * GroupResource specifies a Group and a Resource, but does not force a version.
 */
export class GroupResource {
  /**
   * Construct a GroupResource.
   * @param {string} group - Resource group.
   * @param {string} resource - Resource name.
   */
  constructor(group, resource) {
    this.group = group;
    this.resource = resource;
  }

  /**
   * withVersion() creates a GroupVersionResource based on the GroupResource
   * and Version.
   * @param {string} version - Resource version.
   * @returns {GroupVersionResource}
   */
  withVersion(version) {
    return new GroupVersionResource(this.group, version, this.resource);
  }

  /**
   * toString() returns a string representation of the GroupResource.
   * @returns {string}
   */
  toString() {
    if (this.group === '') {
      return this.resource;
    }

    return `${this.resource}.${this.group}`;
  }

  /**
   * fromString() attempts to construct a GroupResource instance from the
   * provided "resource.group" string. Empty strings are allowed for both
   * fields.
   * @param {string} gr - String representation of a group resource.
   * @returns {GroupResource}
   */
  static fromString(gr) {
    const index = gr.indexOf('.');

    if (index === -1) {
      return new GroupResource('', gr);
    }

    return new GroupResource(gr.substring(index + 1), gr.substring(0, index));
  }
}

export default {
  GroupKind,
  GroupVersion,
  GroupVersionKind,
  GroupVersionResource,
};
