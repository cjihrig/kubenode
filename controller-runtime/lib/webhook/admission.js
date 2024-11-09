'use strict';
const metav1 = require('../apimachinery/meta/v1');
const kGroupName = 'admission.k8s.io';
const kOperationConnect = 'CONNECT';
const kOperationCreate = 'CREATE';
const kOperationDelete = 'DELETE';
const kOperationUpdate = 'UPDATE';
const kPatchTypeJSONPatch = 'JSONPatch';

/**
 * @typedef {Object} AdmissionRequestOptions
 * @property {string} uid uid is an identifier for the individual request/response.
 * @property {Object} kind kind is the fully-qualified type of object being submitted.
 * @property {Object} resource resource is the fully-qualified resource being requested.
 * @property {string} [subResource] subResource is the subresource being requested, if any.
 * @property {Object} requestKind requestKind is the fully-qualified type of the original API request
 * @property {Object} requestResource requestResource is the fully-qualified resource of the original API request.
 * @property {string} [requestSubResource] requestSubResource is the name of the subresource of the original API request, if any.
 * @property {string} name name is the name of the object as presented in the request.
 * @property {string} [namespace] namespace is the namespace associated with the request, if any.
 * @property {string} operation operation is the operation being performed.
 * @property {Object} userInfo userInfo is information about the requesting user.
 * @property {Object} object object is the object from the incoming request.
 * @property {Object} [oldObject] oldObject is the existing object. Only populated for DELETE and UPDATE requests.
 * @property {Object} [dryRun] dryRun indicates that modifications will definitely not be persisted for this request.
 * @property {Object} [options] options is the operation option structure of the operation being performed.
 */

/**
 * @typedef {Object} AdmissionResponseOptions
 * @property {string} [uid] uid is an identifier for the individual request/response.
 * @property {boolean} allowed allowed indicates whether or not the admission request was permitted.
 * @property {Object} [status] status contains extra details into why an admission request was denied.
 * @property {Object} [patch] The patch body.
 * @property {Object[]} [patches] patches are the JSON patches for mutating webhooks.
 * @property {Object} [auditAnnotations] auditAnnotations is an unstructured key value map set by remote admission controller
 * @property {string[]} [warnings] warnings is a list of warning messages to return to the requesting API client.
 */

/**
 * @typedef {Object} AdmissionReviewOptions
 * @property {Object} [request] Object used to create an AdmissionRequest.
 * @property {Object} [response] Object used to create an AdmissionResponse.
 */

class AdmissionRequest {
  /**
   * Creates a new AdmissionRequest instance.
   * @param {AdmissionRequestOptions} options Options used to construct instance.
   */
  constructor(options) {
    if (options === null || typeof options !== 'object') {
      throw new TypeError('options must be an object or boolean');
    }

    const {
      uid,
      kind,
      resource,
      subResource,
      requestKind,
      requestResource,
      requestSubResource,
      name,
      namespace,
      operation,
      userInfo,
      object,
      oldObject,
      dryRun,
      options: reqOptions
    } = options;

    this.uid = uid;
    this.kind = kind;
    this.resource = resource;
    this.subResource = subResource;
    this.requestKind = requestKind;
    this.requestResource = requestResource;
    this.requestSubResource = requestSubResource;
    this.name = name;
    this.namespace = namespace;
    this.operation = operation;
    this.userInfo = userInfo;
    this.object = object;
    this.oldObject = oldObject;
    this.dryRun = dryRun;
    this.options = reqOptions;
  }
}

class AdmissionResponse {
  /**
   * Creates a new AdmissionResponse instance.
   * @param {AdmissionResponseOptions} options Options used to construct instance.
   */
  constructor(options) {
    if (typeof options === 'boolean') {
      options = { allowed: options };
    }

    if (options === null || typeof options !== 'object') {
      throw new TypeError('options must be an object or boolean');
    }

    const {
      uid,
      allowed,
      status,
      patch,
      patches,
      auditAnnotations,
      warnings
    } = options;

    if (status !== undefined &&
        (status === null || typeof status !== 'object')) {
      throw new TypeError('options.status must be an object');
    }

    this.uid = uid;
    this.allowed = allowed;
    this.status = status;
    this.patch = patch;
    this.patches = patches;
    this.patchType = undefined;
    this.auditAnnotations = auditAnnotations;
    this.warnings = warnings;
  }

  /**
   * complete() populates any fields that are yet to be set in the underlying response.
   * @param {AdmissionRequest} req The request corresponding to this response.
   */
  complete(req) {
    this.uid = req?.uid;

    if (this.status === undefined) {
      this.status = {};
    }

    if (this.status.code === undefined) {
      this.status.code = 200;
    }

    if (Array.isArray(this.patches) && this.patches.length > 0) {
      this.patch = JSON.stringify(this.patches);
    }

    this.patches = undefined;

    if (this.patch) {
      this.patchType = kPatchTypeJSONPatch;
    }
  }
}

class AdmissionReview {
  /**
   * Creates a new AdmissionReview instance.
   * @param {AdmissionReviewOptions} options Options used to construct instance.
   */
  constructor(options) {
    if (options === null || typeof options !== 'object') {
      throw new TypeError('options must be an object or boolean');
    }

    const {
      request,
      response
    } = options;

    this.apiVersion = `${kGroupName}/v1`;
    this.kind = 'AdmissionReview';

    if (request !== undefined) {
      this.request = new AdmissionRequest(request);
    }

    if (response !== undefined) {
      this.response = new AdmissionResponse(response);
    }
  }
}

/**
 * allowed() constructs a response indicating that the given operation is allowed.
 * @param {string} [message] additional message to attach to the response.
 * @returns {AdmissionResponse}
 */
function allowed(message) {
  return validationResponse(true, message);
}

/**
 * denied() constructs a response indicating that the given operation is denied.
 * @param {string} [message] additional message to attach to the response.
 * @returns {AdmissionResponse}
 */
function denied(message) {
  return validationResponse(false, message);
}

/**
 * errored() creates a new response for error-handling a request.
 * @param {number} code error code to return.
 * @param {Error} [err] an error whose message is included in the response.
 * @returns {AdmissionResponse}
 */
function errored(code, err) {
  const message = err === undefined ? undefined : err?.message ?? String(err);

  return new AdmissionResponse({
    allowed: false,
    status: { code, message }
  });
}

/**
 * validationResponse() returns a response for admitting a request.
 * @param {boolean} allowed allowed indicates whether or not the admission request was permitted.
 * @param {string} [message] additional message to attach to the response.
 * @returns {AdmissionResponse}
 */
function validationResponse(allowed, message) {
  let reason;
  let code;

  if (allowed) {
    code = 200;
    // Leave reason undefined so it won't be serialized.
  } else {
    code = 403;
    reason = metav1.StatusReasonForbidden;
  }

  return new AdmissionResponse({
    allowed,
    status: { code, reason, message }
  });
}

module.exports = {
  AdmissionReview,
  AdmissionRequest,
  AdmissionResponse,
  GroupName: kGroupName,
  OperationConnect: kOperationConnect,
  OperationCreate: kOperationCreate,
  OperationDelete: kOperationDelete,
  OperationUpdate: kOperationUpdate,
  PatchTypeJSONPatch: kPatchTypeJSONPatch,
  allowed,
  denied,
  errored,
  validationResponse
};
