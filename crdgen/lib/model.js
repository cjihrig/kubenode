/**
 * @import { ModelCommentConfig } from './index'
 */
'use strict';
const pluralize = require('pluralize');
const ts = require('typescript');
const kDescriptionTag = 'description';

/**
 * @typedef {object} ModelCRD
 * @property {string} apiVersion
 * @property {string} kind
 * @property {object} metadata
 * @property {object} spec
 */

/**
 * Class representing a single custom resource model.
 */
class Model {
  #node;
  #program;

  /**
   * Construct a model.
   * @param {ts.Program} program - TypeScript API Program.
   * @param {ts.TypeAliasDeclaration} node - TypeScript API TypeAliasDeclaration node.
   * @param {ModelCommentConfig} config - Model configuration extracted from JSDoc comments.
   */
  constructor(program, node, config) {
    const { apiVersion } = config;
    let { kind } = config;

    if (!kind) {
      const rawName = node.name.escapedText;
      // @ts-ignore
      kind = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    }

    const parts = apiVersion.split('/');

    let group;
    let version;

    if (parts.length === 1) {
      group = '';
      version = apiVersion;
    } else {
      group = parts[0];
      version = parts[1];
    }

    this.group = group;
    this.version = version;
    this.kind = kind;
    this.listKind = `${this.kind}List`;
    this.singular = config.singular ?? this.kind.toLowerCase();
    this.plural = config.plural ?? pluralize(this.singular);
    this.description = config.description;
    this.isNamespaced = config.isNamespaced;
    this.#program = program;
    this.#node = node;
  }

  /**
   * Converts the Model to a CRD object that can be stringified to YAML.
   * @returns {ModelCRD} An object representation of the Model as a Kubernetes CRD.
   */
  toCRD() {
    return {
      apiVersion: 'apiextensions.k8s.io/v1',
      kind: 'CustomResourceDefinition',
      metadata: {
        name: `${this.plural}.${this.group}`
      },
      spec: {
        group: this.group,
        names: {
          kind: this.kind,
          listKind: this.listKind,
          plural: this.plural,
          singular: this.singular
        },
        scope: this.isNamespaced ? 'Namespaced' : 'Cluster',
        versions: [
          {
            name: this.version,
            schema: {
              openAPIV3Schema: {
                description: this.description,
                properties: this.#toSchema(),
                type: 'object'
              }
            },
            served: true,
            storage: true,
            subresources: {
              status: {}
            }
          }
        ]
      }
    };
  }

  #toSchema() {
    const checker = this.#program.getTypeChecker();
    // @ts-ignore
    const { members } = this.#node.type;
    const schema = {};

    for (let i = 0; i < members.length; ++i) {
      const member = members[i];
      const symbol = member.symbol;
      const type = checker.getTypeAtLocation(member.type);

      try {
        const s = typeToSchema(checker, symbol, type);

        if (s) {
          schema[symbol.escapedName] = s;
        }
      } catch (err) {
        throw new Error(
          `data type '${checker.typeToString(type)}' is not supported`,
          { cause: err }
        );
      }
    }

    return schema;
  }
}

function typeToSchema(checker, symbol, type) {
  if (isFunction(symbol?.valueDeclaration?.type?.kind)) {
    return;
  }

  const config = getConfigFromComments(symbol);

  if (type.freshType) {
    if (type.freshType.intrinsicName) {
      const name = type.freshType.intrinsicName;

      if (name === 'true' || name === 'false') {
        config.type = 'boolean';
      } else {
        throw new Error(`literal type '${name}' is not supported`);
      }
    } else {
      const { value } = type.freshType;
      config.type = typeof value;

      if (config.type !== 'string' && config.type !== 'number') {
        throw new Error(`type '${value}' is not supported`);
      }
    }

    return config;
  }

  if (type.intrinsicName) {
    const name = type.intrinsicName;

    if (name !== 'string' && name !== 'boolean' &&
        name !== 'number' && name !== 'object') {
      throw new Error(`primitive type '${name}' is not supported`);
    }

    config.type = name;
    return config;
  }

  if (checker.isArrayType(type)) {
    const itemType = checker.getTypeArguments(type)[0];
    const itemSymbol = itemType.symbol;
    const itemSchema = typeToSchema(checker, itemSymbol, itemType);

    if (!itemSchema) {
      const typeString = checker.typeToString(itemType);
      throw new Error(`array of type '${typeString}' is not supported`);
    }

    config.type = 'array';
    config.items = itemSchema;
    return config;
  }

  const properties = {};

  if (type.symbol.members) {
    for (const prop of type.symbol.members.values()) {
      if (!prop.valueDeclaration || isFunction(prop.valueDeclaration.kind)) {
        continue;
      }

      const propType =
          checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);
      const propSymbol = prop.valueDeclaration.symbol;
      const propSchema = typeToSchema(checker, propSymbol, propType);

      if (propSchema) {
        properties[propSymbol.escapedName] = propSchema;
      }
    }
  }

  config.type = 'object';
  config.properties = properties;
  return config;
}

function isFunction(kind) {
  return kind === ts.SyntaxKind.FunctionType ||
         kind === ts.SyntaxKind.MethodSignature;
}

function getConfigFromComments(symbol) {
  let description;

  if (Array.isArray(symbol?.declarations)) {
    for (let i = 0; i < symbol.declarations.length; ++i) {
      const jsDocs = symbol.declarations[i].jsDoc;

      if (!Array.isArray(jsDocs)) {
        continue;
      }

      for (let j = 0; j < jsDocs.length; ++j) {
        const tags = jsDocs[j].tags;

        if (!Array.isArray(tags)) {
          continue;
        }

        for (let k = 0; k < tags.length; ++k) {
          const tag = tags[k];
          const tagName = tag.tagName.escapedText;

          switch (tagName) {
            case kDescriptionTag :
              description = tag.comment;
              break;
          }
        }
      }
    }
  }

  return { description };
}

module.exports = { Model };
