import metav1 from './meta/v1.js';

const knownReasons = new Set([
  metav1.StatusReasonUnauthorized,
  metav1.StatusReasonForbidden,
  metav1.StatusReasonNotFound,
  metav1.StatusReasonAlreadyExists,
  metav1.StatusReasonConflict,
  metav1.StatusReasonGone,
  metav1.StatusReasonInvalid,
  metav1.StatusReasonServerTimeout,
  metav1.StatusReasonTimeout,
  metav1.StatusReasonTooManyRequests,
  metav1.StatusReasonBadRequest,
  metav1.StatusReasonMethodNotAllowed,
  metav1.StatusReasonNotAcceptable,
  metav1.StatusReasonRequestEntityTooLarge,
  metav1.StatusReasonUnsupportedMediaType,
  metav1.StatusReasonInternalError,
  metav1.StatusReasonExpired,
  metav1.StatusReasonServiceUnavailable
]);

// Note - some of the functions in this file appear to be inconsistent. For
// example, isNotFound() consults the knownReasons Set, while
// isRequestEntityTooLargeError() does not. This is done intentionally to match
// the inconsistencies in the Golang implementation.

/**
 * reasonForError() returns the reason for a particular error.
 * @param {Error} err
 * @returns {string} A StatusReason representing the cause of the error.
 */
export function reasonForError(err) {
  // @ts-ignore
  const reason = err?.body?.reason;

  return knownReasons.has(reason) ? reason : metav1.StatusReasonUnknown;
}

/**
 * reasonAndCodeForError() returns the reason and code for a particular error.
 * @param {Error} err
 * @returns {[string, number]} An array containing the reason and code of the
 * error.
 */
export function reasonAndCodeForError(err) {
  // @ts-ignore
  const reason = err?.body?.reason;
  // @ts-ignore
  const code = err?.body?.code;
  return [reason, code];
}

/**
 * isAlreadyExists() determines if the err is an error which indicates that a
 * specified resource already exists.
 * @param {Error} err
 * @returns {boolean}
 */
export function isAlreadyExists(err) {
  return reasonForError(err) === metav1.StatusReasonAlreadyExists;
}

/**
 * isBadRequest() determines if err is an error which indicates that the request
 * is invalid.
 * @param {Error} err
 * @returns {boolean}
 */
export function isBadRequest(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonBadRequest ||
    (code === 400 && !knownReasons.has(reason));
}

/**
 * isConflict() determines if the err is an error which indicates the provided
 * update conflicts.
 * @param {Error} err
 * @returns {boolean}
 */
export function isConflict(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonConflict ||
    (code === 409 && !knownReasons.has(reason));
}

/**
 * isForbidden() determines if err is an error which indicates that the request
 * is forbidden and cannot be completed as requested.
 * @param {Error} err
 * @returns {boolean}
 */
export function isForbidden(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonForbidden ||
    (code === 403 && !knownReasons.has(reason));
}

/**
 * isGone() is true if the error indicates the requested resource is no longer
 * available.
 * @param {Error} err
 * @returns {boolean}
 */
export function isGone(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonGone ||
    (code === 410 && !knownReasons.has(reason));
}

/**
 * isInternalError() determines if err is an error which indicates an internal
 * server error.
 * @param {Error} err
 * @returns {boolean}
 */
export function isInternalError(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonInternalError ||
    (code === 500 && !knownReasons.has(reason));
}

/**
 * isInvalid() determines if the err is an error which indicates the provided
 * resource is not valid.
 * @param {Error} err
 * @returns {boolean}
 */
export function isInvalid(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonInvalid ||
    (code === 422 && !knownReasons.has(reason));
}

/**
 * isMethodNotSupported() determines if the err is an error which indicates the
 * provided action could not be performed because it is not supported by the
 * server.
 * @param {Error} err
 * @returns {boolean}
 */
export function isMethodNotSupported(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonMethodNotAllowed ||
    (code === 405 && !knownReasons.has(reason));
}

/**
 * isNotAcceptable() determines if err is an error which indicates that the
 * request failed due to an invalid Accept header.
 * @param {Error} err
 * @returns {boolean}
 */
export function isNotAcceptable(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonNotAcceptable ||
    (code === 406 && !knownReasons.has(reason));
}

/**
 * isNotFound() determines if an err indicating that a resource could not be
 * found.
 * @param {Error} err
 * @returns {boolean}
 */
export function isNotFound(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonNotFound ||
    (code === 404 && !knownReasons.has(reason));
}

/**
 * isRequestEntityTooLargeError() determines if err is an error which indicates
 * the request entity is too large.
 * @param {Error} err
 * @returns {boolean}
 */
export function isRequestEntityTooLargeError(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonRequestEntityTooLarge || code === 413;
}

/**
 * isResourceExpired() is true if the error indicates the resource has expired
 * and the current action is no longer possible.
 * @param {Error} err
 * @returns {boolean}
 */
export function isResourceExpired(err) {
  return reasonForError(err) === metav1.StatusReasonExpired;
}

/**
 * isServerTimeout() determines if err is an error which indicates that the
 * request needs to be retried by the client.
 * @param {Error} err
 * @returns {boolean}
 */
export function isServerTimeout(err) {
  return reasonForError(err) === metav1.StatusReasonServerTimeout;
}

/**
 * isServiceUnavailable() is true if the error indicates the underlying service
 * is no longer available.
 * @param {Error} err
 * @returns {boolean}
 */
export function isServiceUnavailable(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonServiceUnavailable ||
    (code === 503 && !knownReasons.has(reason));
}

/**
 * isTimeout() determines if err is an error which indicates that request times
 * out due to long processing.
 * @param {Error} err
 * @returns {boolean}
 */
export function isTimeout(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonTimeout ||
    (code === 504 && !knownReasons.has(reason));
}

/**
 * isTooManyRequests() determines if err is an error which indicates that there
 * are too many requests that the server cannot handle.
 * @param {Error} err
 * @returns {boolean}
 */
export function isTooManyRequests(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonTooManyRequests || code === 429;
}

/**
 * isUnauthorized() determines if err is an error which indicates that the
 * request is unauthorized and requires authentication by the user.
 * @param {Error} err
 * @returns {boolean}
 */
export function isUnauthorized(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonUnauthorized ||
    (code === 401 && !knownReasons.has(reason));
}

/**
 * isUnsupportedMediaType() determines if err is an error which indicates that
 * the request failed due to an invalid Content-Type header.
 * @param {Error} err
 * @returns {boolean}
 */
export function isUnsupportedMediaType(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonUnsupportedMediaType ||
    (code === 415 && !knownReasons.has(reason));
}

export default {
  isAlreadyExists,
  isBadRequest,
  isConflict,
  isForbidden,
  isGone,
  isInternalError,
  isInvalid,
  isMethodNotSupported,
  isNotAcceptable,
  isNotFound,
  isRequestEntityTooLargeError,
  isResourceExpired,
  isServerTimeout,
  isServiceUnavailable,
  isTimeout,
  isTooManyRequests,
  isUnauthorized,
  isUnsupportedMediaType,
  reasonForError
};
