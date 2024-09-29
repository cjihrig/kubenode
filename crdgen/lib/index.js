'use strict';
const ts = require('typescript');
const { Model } = require('./model');
const kApiVersionTag = 'apiVersion';
const kDescriptionTag = 'description';
const kKindTag = 'kind';
const kModelTag = 'kubenode';
const kPluralTag = 'plural';
const kScopeTag = 'scope';
const kSingularTag = 'singular';

/**
 * @typedef {object} ModelCommentConfig
 * @property {string} apiVersion
 * @property {string} description
 * @property {string} kind
 * @property {boolean} isNamespaced
 * @property {string} plural
 * @property {string} singular
 */

/**
 * Generates models defined in a collection of files.
 * @param {string[]} filenames - The files to extract models from.
 * @returns {Map<string, Model>}
 */
function generateModelsFromFiles(filenames) {
  const program = ts.createProgram(filenames, { target: ts.ScriptTarget.ES5 });
  const models = new Map();

  for (const filename of filenames) {
    const sourceFile = program.getSourceFile(filename);

    if (sourceFile === undefined) {
      throw new Error(`cannot find source for file: '${filename}'`);
    }

    sourceFile.forEachChild((node) => {
      if (!ts.isTypeAliasDeclaration(node)) {
        return;
      }

      // @ts-ignore
      const config = getModelConfigFromComments(node.jsDoc);
      if (config === undefined) {
        return;
      }

      const model = new Model(program, node, config);
      models.set(model.kind, model);
    });
  }

  return models;
}

/**
 * Extracts a model configuration from JSDoc comments.
 * @param {any[]} [jsDocs]
 * @returns {ModelCommentConfig}
 */
function getModelConfigFromComments(jsDocs) {
  if (jsDocs === undefined) {
    return;
  }

  for (let i = 0; i < jsDocs.length; ++i) {
    const jsDoc = jsDocs[i];
    if (jsDoc.tags?.[0].tagName.escapedText !== kModelTag) {
      continue;
    }

    let isNamespaced = true;
    let apiVersion;
    let description;
    let kind;
    let plural;
    let singular;

    for (let j = 1; j < jsDoc.tags.length; ++j) {
      const tag = jsDoc.tags[j];
      const tagName = tag.tagName.escapedText;

      switch (tagName) {
        case kApiVersionTag :
          apiVersion = tag.comment;
          break;
        case kDescriptionTag :
          description = tag.comment;
          break;
        case kKindTag :
          kind = tag.comment;
          break;
        case kScopeTag :
          if (tag.comment === 'cluster') {
            isNamespaced = false;
          }
          break;
        case kPluralTag :
          plural = tag.comment;
          break;
        case kSingularTag :
          singular = tag.comment;
          break;
      }
    }

    return { apiVersion, description, kind, isNamespaced, plural, singular };
  }
}

module.exports = { generateModelsFromFiles };
