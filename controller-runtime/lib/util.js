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
export function withResolvers() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export default {
  withResolvers,
};
