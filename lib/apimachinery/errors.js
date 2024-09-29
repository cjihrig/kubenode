'use strict';
const metav1 = require('./meta/v1');
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

function reasonForError(err) {
  const reason = err?.body?.reason;

  return knownReasons.has(reason) ? reason : metav1.StatusReasonUnknown;
}

function reasonAndCodeForError(err) {
  const reason = err?.body?.reason;
  const code = err?.body?.code;
  return [reason, code];
}

function isAlreadyExists(err) {
  return reasonForError(err) === metav1.StatusReasonAlreadyExists;
}

function isBadRequest(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonBadRequest ||
    (code === 400 && !knownReasons.has(reason));
}

function isConflict(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonConflict ||
    (code === 409 && !knownReasons.has(reason));
}

function isForbidden(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonForbidden ||
    (code === 403 && !knownReasons.has(reason));
}

function isGone(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonGone ||
    (code === 410 && !knownReasons.has(reason));
}

function isInternalError(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonInternalError ||
    (code === 500 && !knownReasons.has(reason));
}

function isInvalid(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonInvalid ||
    (code === 422 && !knownReasons.has(reason));
}

function isMethodNotSupported(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonMethodNotAllowed ||
    (code === 405 && !knownReasons.has(reason));
}

function isNotAcceptable(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonNotAcceptable ||
    (code === 406 && !knownReasons.has(reason));
}

function isNotFound(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonNotFound ||
    (code === 404 && !knownReasons.has(reason));
}

function isRequestEntityTooLargeError(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonRequestEntityTooLarge || code === 413;
}

function isResourceExpired(err) {
  return reasonForError(err) === metav1.StatusReasonExpired;
}

function isServerTimeout(err) {
  return reasonForError(err) === metav1.StatusReasonServerTimeout;
}

function isServiceUnavailable(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonServiceUnavailable ||
    (code === 503 && !knownReasons.has(reason));
}

function isTimeout(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonTimeout ||
    (code === 504 && !knownReasons.has(reason));
}

function isTooManyRequests(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonTooManyRequests || code === 429;
}

function isUnauthorized(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonUnauthorized ||
    (code === 401 && !knownReasons.has(reason));
}

function isUnsupportedMediaType(err) {
  const [reason, code] = reasonAndCodeForError(err);

  return reason === metav1.StatusReasonUnsupportedMediaType ||
    (code === 415 && !knownReasons.has(reason));
}

module.exports = {
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
