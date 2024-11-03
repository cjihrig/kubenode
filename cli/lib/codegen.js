'use strict';
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const crdgen = require('@kubenode/crdgen');
const yaml = require('js-yaml');
const kCommand = 'codegen';
const kDescription = 'Generate code from project resources';
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

// eslint-disable-next-line require-await
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
  const gvDirName = `${flags.group}_${flags.version}`.toLowerCase();
  const ctrlDir = join(projectDir, 'lib', 'controller', gvDirName);
  const typePath = join(ctrlDir, `${flags.kind.toLowerCase()}_types.ts`);
  const crdDir = join(projectDir, 'config', 'crd');
  const crdKustomizationFile = join(crdDir, 'kustomization.yaml');
  const models = crdgen.generateModelsFromFiles([typePath]);
  const crdYamlFiles = [];

  mkdirSync(crdDir, { recursive: true });

  for (const [kind, model] of models) {
    const filename = `${gvDirName}_${kind.toLowerCase()}.yaml`;
    const fullname = join(crdDir, filename);
    const crd = model.toCRD();
    const crdYaml = yaml.dump(crd);

    writeFileSync(fullname, crdYaml);
    crdYamlFiles.push(filename);
  }

  createOrUpdateKustomizationFile(crdKustomizationFile, crdYamlFiles);
}

function createOrUpdateKustomizationFile(filename, crdFiles) {
  let body;

  try {
    const yamlData = readFileSync(filename, 'utf8');
    body = yaml.load(yamlData, { filename });
  } catch (err) {
    body = {
      apiVersion: 'kustomize.config.k8s.io/v1beta1',
      kind: 'Kustomization'
    };
  }

  // @ts-ignore
  body.resources ??= [];

  for (let i = 0; i < crdFiles.length; ++i) {
    const file = crdFiles[i];

    // @ts-ignore
    if (!body.resources.includes(file)) {
      // @ts-ignore
      body.resources.push(file);
    }
  }

  writeFileSync(filename, yaml.dump(body));
}

module.exports = {
  command: kCommand,
  description: kDescription,
  flags,
  run
};
