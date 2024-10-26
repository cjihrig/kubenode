'use strict';
const { mkdirSync, writeFileSync } = require('node:fs');
const { basename, join, resolve } = require('node:path');
const { Project } = require('./project');
const kCommand = 'init';
const kDescription = 'Initialize a new project';
const kProjectVersion = '0';
const flags = {
  domain: {
    type: 'string',
    multiple: false,
    short: 'd',
    description: 'Domain for CRDs in the project.'
  },
  'project-name': {
    type: 'string',
    multiple: false,
    short: 'p',
    default: basename(process.cwd()) ?? 'kubenode-project',
    description: 'Name of the project. Default: current directory name'
  }
};
let templates;

// eslint-disable-next-line require-await
async function run(flags, positionals) {
  if (flags.domain === undefined) {
    throw new Error('--domain must be specified');
  }

  const projectDir = resolve(flags.directory);
  const srcDir = join(projectDir, 'lib');
  const packageJson = join(projectDir, 'package.json');
  const dockerfile = join(projectDir, 'Dockerfile');
  const main = join(srcDir, 'index.js');
  const mainTest = join(srcDir, 'index.test.js');
  const managerDir = join(projectDir, 'config', 'manager');
  const managerConfig = join(managerDir, 'manager.yaml');
  const data = {
    domain: flags.domain,
    projectName: flags['project-name'],
    projectPath: projectDir,
    version: kProjectVersion
  };
  const project = new Project(data);

  lazyLoadTemplates();
  mkdirSync(srcDir, { recursive: true });
  mkdirSync(managerDir, { recursive: true });
  writeFileSync(dockerfile, templates.dockerfile(data));
  writeFileSync(packageJson, templates.packageJson(data));
  writeFileSync(main, templates.main(data));
  writeFileSync(mainTest, templates.mainTest(data));
  writeFileSync(managerConfig, templates.manager(data));
  project.write();
}

function lazyLoadTemplates() {
  templates = require('./templates/init');
}

module.exports = {
  command: kCommand,
  description: kDescription,
  flags,
  run
};
