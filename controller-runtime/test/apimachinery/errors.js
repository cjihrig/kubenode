'use strict';
const assert = require('node:assert');
const { test } = require('node:test');
const errors = require('../../lib/apimachinery/errors');
const metav1 = require('../../lib/apimachinery/meta/v1');

test('reasonForError() with a known reason', () => {
  const err = { body: { reason: metav1.StatusReasonNotFound } };
  assert.strictEqual(errors.reasonForError(err), metav1.StatusReasonNotFound);
});

test('reasonForError() with an unknown reason', () => {
  const err = { body: { reason: 'foobar' } };
  assert.strictEqual(errors.reasonForError(err), '');
});

test('reasonForError() with an unexpected input', () => {
  assert.strictEqual(errors.reasonForError(false), '');
});

test('isAlreadyExists()', () => {
  const err = { body: { reason: metav1.StatusReasonAlreadyExists } };
  assert.strictEqual(errors.isAlreadyExists(err), true);
  assert.strictEqual(errors.isAlreadyExists({}), false);
});

test('isBadRequest()', () => {
  const err = { body: { reason: metav1.StatusReasonBadRequest } };
  assert.strictEqual(errors.isBadRequest(err), true);
  assert.strictEqual(errors.isBadRequest({ body: { code: 400 } }), true);
  assert.strictEqual(errors.isBadRequest({}), false);
  assert.strictEqual(errors.isBadRequest({
    body: { code: 400, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});

test('isConflict()', () => {
  const err = { body: { reason: metav1.StatusReasonConflict } };
  assert.strictEqual(errors.isConflict(err), true);
  assert.strictEqual(errors.isConflict({ body: { code: 409 } }), true);
  assert.strictEqual(errors.isConflict({}), false);
  assert.strictEqual(errors.isConflict({
    body: { code: 409, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});

test('isForbidden()', () => {
  const err = { body: { reason: metav1.StatusReasonForbidden } };
  assert.strictEqual(errors.isForbidden(err), true);
  assert.strictEqual(errors.isForbidden({ body: { code: 403 } }), true);
  assert.strictEqual(errors.isForbidden({}), false);
  assert.strictEqual(errors.isForbidden({
    body: { code: 403, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});

test('isGone()', () => {
  const err = { body: { reason: metav1.StatusReasonGone } };
  assert.strictEqual(errors.isGone(err), true);
  assert.strictEqual(errors.isGone({ body: { code: 410 } }), true);
  assert.strictEqual(errors.isGone({}), false);
  assert.strictEqual(errors.isGone({
    body: { code: 410, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});

test('isInternalError()', () => {
  const err = { body: { reason: metav1.StatusReasonInternalError } };
  assert.strictEqual(errors.isInternalError(err), true);
  assert.strictEqual(errors.isInternalError({ body: { code: 500 } }), true);
  assert.strictEqual(errors.isInternalError({}), false);
  assert.strictEqual(errors.isInternalError({
    body: { code: 500, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});

test('isInvalid()', () => {
  const err = { body: { reason: metav1.StatusReasonInvalid } };
  assert.strictEqual(errors.isInvalid(err), true);
  assert.strictEqual(errors.isInvalid({ body: { code: 422 } }), true);
  assert.strictEqual(errors.isInvalid({}), false);
  assert.strictEqual(errors.isInvalid({
    body: { code: 422, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});

test('isMethodNotSupported()', () => {
  const err = { body: { reason: metav1.StatusReasonMethodNotAllowed } };
  assert.strictEqual(errors.isMethodNotSupported(err), true);
  assert.strictEqual(errors.isMethodNotSupported({ body: { code: 405 } }), true);
  assert.strictEqual(errors.isMethodNotSupported({}), false);
  assert.strictEqual(errors.isMethodNotSupported({
    body: { code: 405, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});

test('isNotAcceptable()', () => {
  const err = { body: { reason: metav1.StatusReasonNotAcceptable } };
  assert.strictEqual(errors.isNotAcceptable(err), true);
  assert.strictEqual(errors.isNotAcceptable({ body: { code: 406 } }), true);
  assert.strictEqual(errors.isNotAcceptable({}), false);
  assert.strictEqual(errors.isNotAcceptable({
    body: { code: 406, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});

test('isNotFound()', () => {
  const err = { body: { reason: metav1.StatusReasonNotFound } };
  assert.strictEqual(errors.isNotFound(err), true);
  assert.strictEqual(errors.isNotFound({ body: { code: 404 } }), true);
  assert.strictEqual(errors.isNotFound({}), false);
  assert.strictEqual(errors.isNotFound({
    body: { code: 404, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});

test('isRequestEntityTooLargeError()', () => {
  const err = { body: { reason: metav1.StatusReasonRequestEntityTooLarge } };
  assert.strictEqual(errors.isRequestEntityTooLargeError(err), true);
  assert.strictEqual(errors.isRequestEntityTooLargeError({
    body: { code: 413 }
  }), true);
  assert.strictEqual(errors.isRequestEntityTooLargeError({}), false);
});

test('isResourceExpired()', () => {
  const err = { body: { reason: metav1.StatusReasonExpired } };
  assert.strictEqual(errors.isResourceExpired(err), true);
  assert.strictEqual(errors.isResourceExpired({}), false);
});

test('isServerTimeout()', () => {
  const err = { body: { reason: metav1.StatusReasonServerTimeout } };
  assert.strictEqual(errors.isServerTimeout(err), true);
  assert.strictEqual(errors.isServerTimeout({}), false);
});

test('isServiceUnavailable()', () => {
  const err = { body: { reason: metav1.StatusReasonServiceUnavailable } };
  assert.strictEqual(errors.isServiceUnavailable(err), true);
  assert.strictEqual(errors.isServiceUnavailable({
    body: { code: 503 }
  }), true);
  assert.strictEqual(errors.isServiceUnavailable({}), false);
  assert.strictEqual(errors.isServiceUnavailable({
    body: { code: 503, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});

test('isTimeout()', () => {
  const err = { body: { reason: metav1.StatusReasonTimeout } };
  assert.strictEqual(errors.isTimeout(err), true);
  assert.strictEqual(errors.isTimeout({ body: { code: 504 } }), true);
  assert.strictEqual(errors.isTimeout({}), false);
  assert.strictEqual(errors.isTimeout({
    body: { code: 504, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});

test('isTooManyRequests()', () => {
  const err = { body: { reason: metav1.StatusReasonTooManyRequests } };
  assert.strictEqual(errors.isTooManyRequests(err), true);
  assert.strictEqual(errors.isTooManyRequests({ body: { code: 429 } }), true);
  assert.strictEqual(errors.isTooManyRequests({}), false);
});

test('isUnauthorized()', () => {
  const err = { body: { reason: metav1.StatusReasonUnauthorized } };
  assert.strictEqual(errors.isUnauthorized(err), true);
  assert.strictEqual(errors.isUnauthorized({ body: { code: 401 } }), true);
  assert.strictEqual(errors.isUnauthorized({}), false);
  assert.strictEqual(errors.isUnauthorized({
    body: { code: 401, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});

test('isUnsupportedMediaType()', () => {
  const err = { body: { reason: metav1.StatusReasonUnsupportedMediaType } };
  assert.strictEqual(errors.isUnsupportedMediaType(err), true);
  assert.strictEqual(errors.isUnsupportedMediaType({
    body: { code: 415 }
  }), true);
  assert.strictEqual(errors.isUnsupportedMediaType({}), false);
  assert.strictEqual(errors.isUnsupportedMediaType({
    body: { code: 415, reason: metav1.StatusReasonAlreadyExists }
  }), false);
});
