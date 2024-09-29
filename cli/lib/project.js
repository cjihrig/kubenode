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
      const r = resources[i];

      if (typeof r.group !== 'string') {
        throw new TypeError(
          `project.resources[${i}].group must be a string`
        );
      }

      if (typeof r.version !== 'string') {
        throw new TypeError(
          `project.resources[${i}].version must be a string`
        );
      }

      if (typeof r.kind !== 'string') {
        throw new TypeError(
          `project.resources[${i}].kind must be a string`
        );
      }

      if (r.controller === undefined) {
        r.controller = false;
      } else if (typeof r.controller !== 'boolean') {
        throw new TypeError(
          `project.resources[${i}].controller must be a boolean`
        );
      }

      // TODO(cjihrig): These should be validated instead of only defaulting.
      r.api = { crdVersion: 'v1', namespaced: true };
      r.webhooks = {
        defaulting: false,
        validation: false,
        webhookVersion: 'v1'
      };
    }

    this.domain = domain;
    this.markers = null;
    this.projectName = projectName;
    this.projectPath = projectPath;
    this.version = version;
    this.resources = resources;
  }

  addResource(r) {
    const existing = this.getResource(r.group, r.version, r.kind);

    if (existing) {
      throw new Error(
        `'${r.kind}.${r.group}/${r.version}' API already exists`
      );
    }

    this.resources.push(r);
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

module.exports = { Project };
