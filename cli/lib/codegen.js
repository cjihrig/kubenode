'use strict';
const { mkdirSync, writeFileSync } = require('node:fs');
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
  const projectDir = resolve(flags.directory);
  const gvDirName = `${flags.group}_${flags.version}`.toLowerCase();
  const ctrlDir = join(projectDir, 'lib', 'controller', gvDirName);
  const typePath = join(ctrlDir, `${flags.kind.toLowerCase()}_types.ts`);
  const crdDir = join(projectDir, 'config', 'crd');
  const models = crdgen.generateModelsFromFiles([typePath]);

  mkdirSync(crdDir, { recursive: true });

  for (const [kind, model] of models) {
    const filename = join(crdDir, `${gvDirName}_${kind.toLowerCase()}.yaml`);
    const crd = model.toCRD();
    const crdYaml = yaml.dump(crd);

    writeFileSync(filename, crdYaml);
  }
}

module.exports = {
  command: kCommand,
  description: kDescription,
  flags,
  run
};
