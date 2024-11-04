'use strict';
const { readFileSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { parse: parseReference } = require('@kubenode/reference');
const yaml = require('js-yaml');
const { Project } = require('../project');
const kCommand = 'manager-image';
const kDescription = 'Configure the manager image';

// eslint-disable-next-line require-await
async function run(flags, positionals) {
  if (positionals.length !== 3) {
    throw new Error('incorrect arguments. expected image argument only');
  }

  const reference = positionals[2];
  const refObject = parseReference(reference);
  const projectDir = resolve(flags.directory);
  const packageJson = join(projectDir, 'package.json');
  const managerDir = join(projectDir, 'config', 'manager');
  const managerKustomization = join(managerDir, 'kustomization.yaml');

  Project.fromDirectory(projectDir);
  updatePackageJsonScripts(packageJson, reference);
  updateManagerKustomization(managerKustomization, refObject);
}

function updatePackageJsonScripts(filename, reference) {
  const json = JSON.parse(readFileSync(filename, 'utf8'));
  json.scripts ??= {};
  json.scripts['docker-build'] = `docker build . -t ${reference}`;
  json.scripts['docker-push'] = `docker push ${reference}`;
  writeFileSync(filename, JSON.stringify(json, null, 2));
}

function updateManagerKustomization(filename, reference) {
  const yamlData = readFileSync(filename, 'utf8');
  const body = yaml.load(yamlData, { filename });

  // @ts-ignore
  body.images ??= [];
  // @ts-ignore
  const { images } = body;
  const controller = images.find((image) => {
    return image?.name === 'controller';
  });

  if (controller === undefined) {
    throw new Error(`'controller' image not found in '${filename}'`);
  }

  const { domain, path } = reference.namedRepository;
  const newName = domain ? `${domain}/${path}` : path;
  const newTag = reference.tag ?? 'latest';

  controller.newName = newName;
  controller.newTag = newTag;

  writeFileSync(filename, yaml.dump(body));
}

module.exports = {
  command: kCommand,
  description: kDescription,
  run
};
