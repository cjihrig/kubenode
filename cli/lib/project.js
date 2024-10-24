'use strict';
const {
  createReadStream,
  readFileSync,
  writeFileSync
} = require('node:fs');
const { EOL } = require('node:os');
const { join } = require('node:path');
const { createInterface } = require('node:readline');
const kConfigFile = 'kubenode.json';
const kMarkerRegEx = /^\s*\/\/\s*(@kubenode:.+)\s*$/;

class Project {
  constructor(data = {}) {
    if (data === null || typeof data !== 'object') {
      throw new Error('project data must be an object');
    }

    const {
      // @ts-ignore
      domain,
      // @ts-ignore
      projectName,
      // @ts-ignore
      projectPath,
      // @ts-ignore
      version,
      // @ts-ignore
      resources = []
    } = data;

    if (typeof domain !== 'string') {
      throw new Error('project.domain must be a string');
    }

    if (typeof projectName !== 'string') {
      throw new Error('project.projectName must be a string');
    }

    if (typeof projectPath !== 'string') {
      throw new Error('project.projectPath must be a string');
    }

    if (typeof version !== 'string') {
      throw new Error('project.version must be a string');
    }

    if (!Array.isArray(resources)) {
      throw new Error('project.resources must be an array');
    }

    for (let i = 0; i < resources.length; ++i) {
      initializeResource(resources[i], `project.resources[${i}]`);
    }

    this.domain = domain;
    this.markers = null;
    this.projectName = projectName;
    this.projectPath = projectPath;
    this.version = version;
    this.resources = resources;
  }

  ensureResource(r) {
    const existing = this.getResource(r.group, r.version, r.kind);

    if (existing) {
      return existing;
    }

    initializeResource(r, 'resource');
    this.resources.push(r);
    return r;
  }

  getResource(group, version, kind) {
    return this.resources.find((r) => {
      return r.group === group && r.version === version && r.kind === kind;
    });
  }

  inject(filename, marker, str) {
    this.markers ??= new Map();
    let fileEntry = this.markers.get(filename);
    if (fileEntry === undefined) {
      fileEntry = new Map();
      this.markers.set(filename, fileEntry);
    }

    let markerEntry = fileEntry.get(marker);
    if (markerEntry === undefined) {
      markerEntry = [];
      fileEntry.set(marker, markerEntry);
    }

    markerEntry.push(str);
  }

  toJSON() {
    return {
      domain: this.domain,
      projectName: this.projectName,
      version: this.version,
      resources: this.resources
    };
  }

  write() {
    const data = JSON.stringify(this, null, 2);
    const path = join(this.projectPath, kConfigFile);
    writeFileSync(path, data);
  }

  async writeMarkers() {
    if (this.markers === null) {
      return;
    }

    for (const [file, markers] of this.markers.entries()) {
      const lines = createInterface({
        input: createReadStream(file),
        crlfDelay: Infinity
      });
      const output = [];

      for await (const line of lines) {
        const match = line.match(kMarkerRegEx);

        if (match !== null) {
          const marker = markers.get(match[1]);

          if (marker !== undefined) {
            output.push(...marker);
          }
        }

        output.push(line);
      }

      writeFileSync(file, output.join(EOL));
    }
  }

  static fromDirectory(directory) {
    if (typeof directory !== 'string') {
      throw new Error('directory must be a string');
    }

    const configFile = join(directory, kConfigFile);

    try {
      const data = readFileSync(configFile, 'utf8');
      const obj = JSON.parse(data);

      obj.projectPath = directory;
      return new Project(obj);
    } catch (err) {
      throw new Error(
        `could not read project file: '${configFile}'`,
        { cause: err }
      );
    }
  }
}

function initializeResource(r, name) {
  if (typeof r.group !== 'string') {
    throw new TypeError(`${name}.group must be a string`);
  }

  if (typeof r.version !== 'string') {
    throw new TypeError(`${name}.version must be a string`);
  }

  if (typeof r.kind !== 'string') {
    throw new TypeError(`${name}.kind must be a string`);
  }

  if (r.controller === undefined) {
    r.controller = false;
  } else if (typeof r.controller !== 'boolean') {
    throw new TypeError(`${name}.controller must be a boolean`);
  }

  if (r.api === undefined) {
    r.api = {};
  } else if (r.api === null || typeof r.api !== 'object') {
    throw new TypeError(`${name}.api must be an object`);
  }

  if (r.api.crdVersion === undefined) {
    r.api.crdVersion = 'v1';
  } else if (r.api.crdVersion !== 'v1') {
    throw new TypeError(`${name}.api.crdVersion must be 'v1'`);
  }

  if (r.api.namespaced === undefined) {
    r.api.namespaced = true;
  } else if (typeof r.api.namespaced !== 'boolean') {
    throw new TypeError(`${name}.api.namespaced must be a boolean`);
  }

  if (r.webhooks === undefined) {
    r.webhooks = {};
  } else if (r.webhooks === null || typeof r.webhooks !== 'object') {
    throw new TypeError(`${name}.webhooks must be an object`);
  }

  if (r.webhooks.defaulting === undefined) {
    r.webhooks.defaulting = false;
  } else if (typeof r.webhooks.defaulting !== 'boolean') {
    throw new TypeError(`${name}.webhooks.defaulting must be a boolean`);
  }

  if (r.webhooks.validation === undefined) {
    r.webhooks.validation = false;
  } else if (typeof r.webhooks.validation !== 'boolean') {
    throw new TypeError(`${name}.webhooks.validation must be a boolean`);
  }

  if (r.webhooks.webhookVersion === undefined) {
    r.webhooks.webhookVersion = 'v1';
  } else if (r.webhooks.webhookVersion !== 'v1') {
    throw new TypeError(`${name}.webhooks.webhookVersion must be 'v1'`);
  }
}

module.exports = { Project };
