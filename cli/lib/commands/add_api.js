'use strict';
const { mkdirSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const pluralize = require('pluralize');
const { Project } = require('../project');
const { updateManagerRole } = require('../rbac');
const kCommand = 'api';
const kDescription = 'Add a new API to a project';
const flags = {
  group: {
    type: 'string',
    multiple: false,
    short: 'g',
    description: 'API group for the CRD.'
  },
  kind: {
    type: 'string',
    multiple: false,
    short: 'k',
    description: 'Kind for the CRD.'
  },
  version: {
    type: 'string',
    multiple: false,
    short: 'v',
    description: 'API version for the CRD.'
  }
};
let templates;

async function run(flags, positionals) {
  if (flags.group === undefined) {
    throw new Error('--group must be specified');
  }

  if (flags.kind === undefined) {
    throw new Error('--kind must be specified');
  }

  if (flags.version === undefined) {
    throw new Error('--version must be specified');
  }

  const projectDir = resolve(flags.directory);
  const project = Project.fromDirectory(projectDir);
  const gvDirName = `${flags.group}_${flags.version}`.toLowerCase();
  const kind = flags.kind.charAt(0).toUpperCase() + flags.kind.slice(1);
  const listKind = `${kind}List`;
  const singular = kind.toLowerCase();
  const plural = pluralize(singular);
  const ctrlDir = join(projectDir, 'lib', 'controller', gvDirName);
  const ctrlFile = `${singular}.js`;
  const ctrl = join(ctrlDir, ctrlFile);
  const typePath = join(ctrlDir, `${singular}_types.ts`);
  const sampleDir = join(projectDir, 'config', 'samples');
  const samplePath = join(sampleDir, `${gvDirName}_${singular}.yaml`);
  const rbacDir = join(projectDir, 'config', 'rbac');
  const rbacConfig = join(rbacDir, 'manager_role.yaml');
  const data = {
    group: flags.group,
    kind,
    listKind,
    plural,
    projectName: project.projectName,
    singular,
    version: flags.version
  };
  const resource = project.ensureResource({
    group: data.group,
    kind: data.kind,
    version: data.version
  });

  if (resource.controller) {
    const gvk = `${resource.kind}.${resource.group}/${resource.version}`;
    throw new Error(`resource '${gvk}' already has a controller`);
  }

  resource.controller = true;
  lazyLoadTemplates();
  mkdirSync(ctrlDir, { recursive: true });
  mkdirSync(sampleDir, { recursive: true });
  writeFileSync(ctrl, templates.controller(data));
  writeFileSync(samplePath, templates.sample(data));
  writeFileSync(typePath, templates.types(data));
  updateManagerRole(rbacConfig, data);

  {
    // Update generated code in existing files.
    const srcDir = join(projectDir, 'lib');
    const main = join(srcDir, 'index.js');
    const ctrlImport = `import { ${kind}Reconciler } from ` +
      `'./controller/${gvDirName}/${ctrlFile}';`;
    const ctrlSetup = `(new ${kind}Reconciler()).setupWithManager(manager);`;
    project.inject(main, '@kubenode:scaffold:imports', ctrlImport);
    project.inject(main, '@kubenode:scaffold:manager', ctrlSetup);
    await project.writeMarkers();
  }

  project.write();
}

function lazyLoadTemplates() {
  templates = require('../templates/add_api');
}

module.exports = {
  command: kCommand,
  description: kDescription,
  flags,
  run
};
