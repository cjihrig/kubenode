'use strict';
const { readFileSync, writeFileSync } = require('node:fs');
const { isDeepStrictEqual } = require('node:util');
const pluralize = require('pluralize');
const yaml = require('js-yaml');

function updateManagerRole(filename, data) {
  const yamlData = readFileSync(filename, 'utf8');
  const body = yaml.loadAll(yamlData, null, { filename });
  const role = body.find((m) => {
    // @ts-ignore
    return m?.kind === 'ClusterRole' &&
      // @ts-ignore
      m?.metadata?.name === `${data.projectName}-manager-role`;
  });

  if (role === undefined) {
    throw new Error(`could not find manager cluster role in '${filename}'`);
  }

  // @ts-ignore
  role.rules ??= [];
  const plural = pluralize(data.kind.toLowerCase());
  // @ts-ignore
  const rule = role.rules.find((r) => {
    return isDeepStrictEqual(r?.apiGroups, [data.group]) &&
      isDeepStrictEqual(r?.resources, [plural]);
  });

  if (rule === undefined) {
    // @ts-ignore
    role.rules.push({
      apiGroups: [data.group],
      resources: [plural],
      verbs: ['create', 'delete', 'get', 'list', 'patch', 'update', 'watch']
    });
  }

  const documents = body.map((doc) => {
    return yaml.dump(doc);
  });
  const manifestYaml = documents.join('---\n');
  writeFileSync(filename, manifestYaml);
}

module.exports = { updateManagerRole };
