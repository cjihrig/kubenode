/**
 * @typedef {Object} PromiseWithResolvers
 * @property {Promise} promise
 * @property {function} resolve
 * @property {function} reject
 */
/**
 * withResolvers() works like Promise.withResolvers().
 * @returns {PromiseWithResolvers}
 */
export function withResolvers(): PromiseWithResolvers;
declare namespace _default {
    export { withResolvers };
}
export default _default;
export type PromiseWithResolvers = {
    promise: Promise<any>;
    resolve: Function;
    reject: Function;
};
