/**
 * isAlreadyExists() determines if the err is an error which indicates that a
 * specified resource already exists.
 * @param {Error} err
 * @returns {boolean}
 */
export function isAlreadyExists(err: Error): boolean;
/**
 * isBadRequest() determines if err is an error which indicates that the request
 * is invalid.
 * @param {Error} err
 * @returns {boolean}
 */
export function isBadRequest(err: Error): boolean;
/**
 * isConflict() determines if the err is an error which indicates the provided
 * update conflicts.
 * @param {Error} err
 * @returns {boolean}
 */
export function isConflict(err: Error): boolean;
/**
 * isForbidden() determines if err is an error which indicates that the request
 * is forbidden and cannot be completed as requested.
 * @param {Error} err
 * @returns {boolean}
 */
export function isForbidden(err: Error): boolean;
/**
 * isGone() is true if the error indicates the requested resource is no longer
 * available.
 * @param {Error} err
 * @returns {boolean}
 */
export function isGone(err: Error): boolean;
/**
 * isInternalError() determines if err is an error which indicates an internal
 * server error.
 * @param {Error} err
 * @returns {boolean}
 */
export function isInternalError(err: Error): boolean;
/**
 * isInvalid() determines if the err is an error which indicates the provided
 * resource is not valid.
 * @param {Error} err
 * @returns {boolean}
 */
export function isInvalid(err: Error): boolean;
/**
 * isMethodNotSupported() determines if the err is an error which indicates the
 * provided action could not be performed because it is not supported by the
 * server.
 * @param {Error} err
 * @returns {boolean}
 */
export function isMethodNotSupported(err: Error): boolean;
/**
 * isNotAcceptable() determines if err is an error which indicates that the
 * request failed due to an invalid Accept header.
 * @param {Error} err
 * @returns {boolean}
 */
export function isNotAcceptable(err: Error): boolean;
/**
 * isNotFound() determines if an err indicating that a resource could not be
 * found.
 * @param {Error} err
 * @returns {boolean}
 */
export function isNotFound(err: Error): boolean;
/**
 * isRequestEntityTooLargeError() determines if err is an error which indicates
 * the request entity is too large.
 * @param {Error} err
 * @returns {boolean}
 */
export function isRequestEntityTooLargeError(err: Error): boolean;
/**
 * isResourceExpired() is true if the error indicates the resource has expired
 * and the current action is no longer possible.
 * @param {Error} err
 * @returns {boolean}
 */
export function isResourceExpired(err: Error): boolean;
/**
 * isServerTimeout() determines if err is an error which indicates that the
 * request needs to be retried by the client.
 * @param {Error} err
 * @returns {boolean}
 */
export function isServerTimeout(err: Error): boolean;
/**
 * isServiceUnavailable() is true if the error indicates the underlying service
 * is no longer available.
 * @param {Error} err
 * @returns {boolean}
 */
export function isServiceUnavailable(err: Error): boolean;
/**
 * isTimeout() determines if err is an error which indicates that request times
 * out due to long processing.
 * @param {Error} err
 * @returns {boolean}
 */
export function isTimeout(err: Error): boolean;
/**
 * isTooManyRequests() determines if err is an error which indicates that there
 * are too many requests that the server cannot handle.
 * @param {Error} err
 * @returns {boolean}
 */
export function isTooManyRequests(err: Error): boolean;
/**
 * isUnauthorized() determines if err is an error which indicates that the
 * request is unauthorized and requires authentication by the user.
 * @param {Error} err
 * @returns {boolean}
 */
export function isUnauthorized(err: Error): boolean;
/**
 * isUnsupportedMediaType() determines if err is an error which indicates that
 * the request failed due to an invalid Content-Type header.
 * @param {Error} err
 * @returns {boolean}
 */
export function isUnsupportedMediaType(err: Error): boolean;
/**
 * reasonForError() returns the reason for a particular error.
 * @param {Error} err
 * @returns {string} A StatusReason representing the cause of the error.
 */
export function reasonForError(err: Error): string;
