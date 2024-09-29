export type ModelCommentConfig = {
    apiVersion: string;
    description: string;
    kind: string;
    isNamespaced: boolean;
    plural: string;
    singular: string;
};
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
export function generateModelsFromFiles(filenames: string[]): Map<string, Model>;
import { Model } from "./model";
