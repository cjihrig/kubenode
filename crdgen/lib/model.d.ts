export type ModelCRD = {
    apiVersion: string;
    kind: string;
    metadata: object;
    spec: object;
};
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
export class Model {
    /**
     * Construct a model.
     * @param {ts.Program} program - TypeScript API Program.
     * @param {ts.TypeAliasDeclaration} node - TypeScript API TypeAliasDeclaration node.
     * @param {ModelCommentConfig} config - Model configuration extracted from JSDoc comments.
     */
    constructor(program: ts.Program, node: ts.TypeAliasDeclaration, config: ModelCommentConfig);
    group: string;
    version: string;
    kind: string;
    listKind: string;
    singular: string;
    plural: any;
    description: string;
    isNamespaced: boolean;
    /**
     * Converts the Model to a CRD object that can be stringified to YAML.
     * @returns {ModelCRD} An object representation of the Model as a Kubernetes CRD.
     */
    toCRD(): ModelCRD;
    #private;
}
import ts = require("typescript");
import type { ModelCommentConfig } from './index';
