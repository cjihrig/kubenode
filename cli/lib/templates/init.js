'use strict';
const cliPackageJson = require('@kubenode/controller-runtime/package.json');

function dockerfile(data) {
  return `FROM node:22-alpine
WORKDIR /usr/app
COPY package.json package.json
COPY lib lib
ENV NODE_ENV production
RUN npm install
USER node
CMD ["node", "lib/index.js"]
`;
}

function main(data) {
  return `import { Manager } from '@kubenode/controller-runtime';
// @kubenode:scaffold:imports

// ATTENTION: YOU **SHOULD** EDIT THIS FILE!

const manager = new Manager();
// @kubenode:scaffold:manager
manager.start();
`;
}

function mainTest(data) {
  return `import { test } from 'node:test';

// ATTENTION: YOU **SHOULD** EDIT THIS FILE!

test('verify application functionality', () => {
});
`;
}

function packageJson(data) {
  const pkg = {
    name: data.projectName,
    version: '1.0.0',
    description: '',
    type: 'module',
    scripts: {
      start: 'node lib/index.js',
      test: 'node --test'
    },
    dependencies: {
      '@kubenode/controller-runtime': `^${cliPackageJson.version}`
    }
  };

  return JSON.stringify(pkg, null, 2);
}

module.exports = {
  dockerfile,
  main,
  mainTest,
  packageJson
};
