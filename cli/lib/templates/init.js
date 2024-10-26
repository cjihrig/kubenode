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

function manager(data) {
  return `apiVersion: v1
kind: Namespace
metadata:
  name: ${data.projectName}
  labels:
    control-plane: controller-manager
    app.kubernetes.io/name: namespace
    app.kubernetes.io/instance: ${data.projectName}
    app.kubernetes.io/component: manager
    app.kubernetes.io/created-by: ${data.projectName}
    app.kubernetes.io/part-of: ${data.projectName}
    app.kubernetes.io/managed-by: kubenode
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: controller-manager
  namespace: ${data.projectName}
  labels:
    control-plane: controller-manager
    app.kubernetes.io/name: deployment
    app.kubernetes.io/instance: controller-manager
    app.kubernetes.io/component: manager
    app.kubernetes.io/created-by: ${data.projectName}
    app.kubernetes.io/part-of: ${data.projectName}
    app.kubernetes.io/managed-by: kubenode
spec:
  selector:
    matchLabels:
      control-plane: controller-manager
  replicas: 1
  revisionHistoryLimit: 2
  template:
    metadata:
      annotations:
        kubectl.kubernetes.io/default-container: manager
      labels:
        control-plane: controller-manager
    spec:
      securityContext:
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault
      containers:
      - command:
        - node
        args:
        - lib/index.js
        image: controller:latest
        imagePullPolicy: Always
        name: manager
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - "ALL"
        resources:
          limits:
            cpu: 500m
            memory: 256Mi
          requests:
            cpu: 10m
            memory: 128Mi
      serviceAccountName: controller-manager
      terminationGracePeriodSeconds: 10
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
  manager,
  packageJson
};
