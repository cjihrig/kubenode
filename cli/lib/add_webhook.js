'use strict';
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const pluralize = require('pluralize');
const yaml = require('js-yaml');
const { Project } = require('./project');
const { updateManagerRole } = require('./rbac');
const kCommand = 'webhook';
const kDescription = 'Add a new webhook to a project';
const flags = {
  group: {
    type: 'string',
    multiple: false,
    short: 'g',
    description: 'API group for the webhook.'
  },
  kind: {
    type: 'string',
    multiple: false,
    short: 'k',
    description: 'Kind for the webhook.'
  },
  mutating: {
    type: 'boolean',
    default: false,
    multiple: false,
    short: 'm',
    description: 'Whether or not to generate a mutating webhook.'
  },
  validating: {
    type: 'boolean',
    default: false,
    multiple: false,
    short: 'a',
    description: 'Whether or not to generate a validating webhook.'
  },
  version: {
    type: 'string',
    multiple: false,
    short: 'v',
    description: 'API version for the webhook.'
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

  if (!flags.validating && !flags.mutating) {
    throw new Error('--validating and/or --mutating must be specified');
  }

  const projectDir = resolve(flags.directory);
  const project = Project.fromDirectory(projectDir);
  const kind = flags.kind.charAt(0).toUpperCase() + flags.kind.slice(1);
  const gvDirName = `${flags.group}_${flags.version}`.toLowerCase();
  const srcDir = join(projectDir, 'lib');
  const main = join(srcDir, 'index.js');
  const webhookSrcDir = join(srcDir, 'webhook', gvDirName);
  const certManagerDir = join(projectDir, 'config', 'certmanager');
  const certManagerFile = join(certManagerDir, 'certificate.yaml');
  const certManagerKustomization = join(certManagerDir, 'kustomization.yaml');
  const webhookDir = join(projectDir, 'config', 'webhook');
  const manifestsFile = join(webhookDir, 'manifests.yaml');
  const serviceFile = join(webhookDir, 'service.yaml');
  const webhookKustomization = join(webhookDir, 'kustomization.yaml');
  const managerDir = join(projectDir, 'config', 'manager');
  const managerConfig = join(managerDir, 'manager.yaml');
  const rbacDir = join(projectDir, 'config', 'rbac');
  const rbacConfig = join(rbacDir, 'manager_role.yaml');
  const kustomizationFile = join(projectDir, 'config', 'kustomization.yaml');
  const data = {
    group: flags.group,
    kind,
    projectName: project.projectName,
    mutating: flags.mutating,
    validating: flags.validating,
    version: flags.version
  };
  const resource = project.ensureResource({
    group: data.group,
    kind: data.kind,
    version: data.version
  });

  if (flags.validating) {
    if (resource.webhooks.validation) {
      const gvk = `${resource.kind}.${resource.group}/${resource.version}`;
      throw new Error(`resource '${gvk}' already has a validation webhook`);
    }

    resource.webhooks.validation = true;
  }

  if (flags.mutating) {
    if (resource.webhooks.defaulting) {
      const gvk = `${resource.kind}.${resource.group}/${resource.version}`;
      throw new Error(`resource '${gvk}' already has a mutating webhook`);
    }

    resource.webhooks.defaulting = true;
  }

  lazyLoadTemplates();
  mkdirSync(webhookSrcDir, { recursive: true });
  mkdirSync(certManagerDir, { recursive: true });
  mkdirSync(webhookDir, { recursive: true });
  writeFileSync(certManagerFile, templates.certificate(data));
  writeFileSync(
    certManagerKustomization, templates.certManagerKustomization(data)
  );
  writeFileSync(
    webhookKustomization, templates.webhookKustomization(data)
  );
  writeFileSync(serviceFile, templates.service(data));
  createOrUpdateManifestsFile(manifestsFile, data);
  updateManagerConfig(managerConfig, data);
  updateManagerRole(rbacConfig, data);

  if (flags.validating) {
    const filename = `${kind.toLowerCase()}_validating_webhook.js`;
    const webhookSrcFile = join(webhookSrcDir, filename);
    const className = `${data.kind}ValidatingWebhook`;
    const hookImport = `import { ${className} } from ` +
      `'./webhook/${gvDirName}/${filename}';`;
    const hookSetup = `(new ${className}()).setupWebhookWithManager(manager);`;
    const templateData = { ...data, className, op: 'validate' };

    project.inject(main, '@kubenode:scaffold:imports', hookImport);
    project.inject(main, '@kubenode:scaffold:manager', hookSetup);
    writeFileSync(webhookSrcFile, templates.webhook(templateData));
  }

  if (flags.mutating) {
    const filename = `${kind.toLowerCase()}_mutating_webhook.js`;
    const webhookSrcFile = join(webhookSrcDir, filename);
    const className = `${data.kind}MutatingWebhook`;
    const hookImport = `import { ${className} } from ` +
      `'./webhook/${gvDirName}/${filename}';`;
    const hookSetup = `(new ${className}()).setupWebhookWithManager(manager);`;
    const templateData = { ...data, className, op: 'mutate' };

    project.inject(main, '@kubenode:scaffold:imports', hookImport);
    project.inject(main, '@kubenode:scaffold:manager', hookSetup);
    writeFileSync(webhookSrcFile, templates.webhook(templateData));
  }

  updateKustomizationFile(kustomizationFile);
  await project.writeMarkers();
  project.write();
}

function lazyLoadTemplates() {
  templates = require('./templates/add_webhook');
}

function updateKustomizationFile(filename) {
  const yamlData = readFileSync(filename, 'utf8');
  const body = yaml.load(yamlData, { filename });

  // @ts-ignore
  body.resources ??= [];
  // @ts-ignore
  const resources = body.resources;
  let index = resources.indexOf('manager') + 1;
  let updated = false;

  if (!resources.includes('certmanager')) {
    resources.splice(index, 0, 'certmanager');
    updated = true;
    index++;
  }

  if (!resources.includes('webhook')) {
    resources.splice(index, 0, 'webhook');
    updated = true;
    index++;
  }

  if (updated) {
    writeFileSync(filename, yaml.dump(body));
  }
}

function createOrUpdateManifestsFile(filename, data) {
  let body;

  try {
    const yamlData = readFileSync(filename, 'utf8');
    body = yaml.loadAll(yamlData, null, { filename });
  } catch (err) {
    body = [];
  }

  if (data.validating) {
    manifestForHook(body, 'ValidatingWebhookConfiguration', data);
  }

  if (data.mutating) {
    manifestForHook(body, 'MutatingWebhookConfiguration', data);
  }

  const documents = body.map((doc) => {
    return yaml.dump(doc);
  });
  const manifestYaml = documents.join('---\n');
  writeFileSync(filename, manifestYaml);
}

function manifestForHook(manifests, hookKind, data) {
  const type = hookKind.charAt(0).toLowerCase();
  let manifest = manifests.find((manifest) => {
    return manifest.kind === hookKind;
  });

  if (manifest === undefined) {
    const hookType = type === 'v' ? 'validating' : 'mutating';
    manifest = {
      apiVersion: 'admissionregistration.k8s.io/v1',
      kind: hookKind,
      metadata: {
        name: `${hookType}-webhook-configuration`,
        annotations: {
          'cert-manager.io/inject-ca-from': `${data.projectName}/serving-cert`
        }
      },
      webhooks: []
    };

    manifests.push(manifest);
  }

  if (!Array.isArray(manifest.webhooks)) {
    manifest.webhooks = [];
  }

  const op = type === 'v' ? 'validate' : 'mutate';
  const lowerKind = data.kind.toLowerCase();
  const dashGroup = data.group.replaceAll('.', '-');
  const path = `/${op}-${dashGroup}-${data.version}-${lowerKind}`.toLowerCase();

  manifest.webhooks.push({
    admissionReviewVersions: ['v1'],
    clientConfig: {
      service: {
        name: 'webhook-service',
        namespace: data.projectName,
        path
      }
    },
    failurePolicy: 'Fail',
    name: `${type}${lowerKind}.kb.io`,
    rules: [
      {
        apiGroups: [data.group],
        apiVersions: [data.version],
        operations: ['CREATE', 'UPDATE', 'DELETE'],
        resources: [pluralize(lowerKind)]
      }
    ],
    sideEffects: 'None'
  });

  return manifest;
}

function updateManagerConfig(filename, data) {
  const yamlData = readFileSync(filename, 'utf8');
  const body = yaml.loadAll(yamlData, null, { filename });
  const deployment = body.find((m) => {
    // @ts-ignore
    return m?.kind === 'Deployment' &&
      // @ts-ignore
      m?.metadata?.name === 'controller-manager' &&
      // @ts-ignore
      m?.metadata?.namespace === data.projectName;
  });

  if (deployment === undefined) {
    throw new Error(`could not find manager deployment in '${filename}'`);
  }

  // @ts-ignore
  deployment.spec ??= {};
  // @ts-ignore
  deployment.spec.template ??= {};
  // @ts-ignore
  deployment.spec.template.spec ??= {};
  // @ts-ignore
  deployment.spec.template.spec.containers ??= [];
  // @ts-ignore
  deployment.spec.template.spec.volumes ??= [];

  // @ts-ignore
  const spec = deployment.spec.template.spec;
  const containers = spec.containers;
  const container = containers.find((c) => {
    return c.name === 'manager';
  });

  if (container === undefined) {
    throw new Error(`could not find manager container in '${filename}'`);
  }

  container.ports ??= [];
  container.volumeMounts ??= [];

  const port = container.ports.find((p) => {
    return p?.name === 'webhook-server' && p?.protocol === 'TCP' &&
      p?.containerPort === 9443;
  });

  if (port === undefined) {
    container.ports.push({
      name: 'webhook-server',
      containerPort: 9443,
      protocol: 'TCP'
    });
  }

  const mount = container.volumeMounts.find((m) => {
    return m?.name === 'cert';
  });

  if (mount === undefined) {
    container.volumeMounts.push({
      name: 'cert',
      mountPath: '/tmp/k8s-webhook-server/serving-certs',
      readOnly: true
    });
  }

  const volumes = spec.volumes;
  const volume = volumes.find((v) => {
    return v?.name === 'cert' &&
      v?.secret?.secretName === 'webhook-server-cert';
  });

  if (volume === undefined) {
    volumes.push({
      name: 'cert',
      secret: {
        defaultMode: 420,
        secretName: 'webhook-server-cert'
      }
    });
  }

  const documents = body.map((doc) => {
    return yaml.dump(doc);
  });
  const manifestYaml = documents.join('---\n');
  writeFileSync(filename, manifestYaml);
}

module.exports = {
  command: kCommand,
  description: kDescription,
  flags,
  run
};
