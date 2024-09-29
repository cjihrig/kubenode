'use strict';

module.exports = {
  /**
   * StatusReasonUnknown means the server has declined to indicate a specific
   * reason. The details field may contain other information about this error.
   * Status code 500.
   */
  StatusReasonUnknown: '',

  /**
   * StatusReasonUnauthorized means the server can be reached and understood the
   * request, but requires the user to present appropriate authorization
   * credentials in order for the action to be completed. If the user has
   * specified credentials on the request, the server considers them
   * insufficient.
   * Status code 401
   */
  StatusReasonUnauthorized: 'Unauthorized',

  /**
   * StatusReasonForbidden means the server can be reached and understood the
   * request, but refuses to take any further action.  It is the result of the
   * server being configured to deny access for some reason to the requested
   * resource by the client.
   * Status code 403
   */
  StatusReasonForbidden: 'Forbidden',

  /**
   * StatusReasonNotFound means one or more resources required for this
   * operation could not be found.
   * Status code 404
   */
  StatusReasonNotFound: 'NotFound',

  /**
   * StatusReasonAlreadyExists means the resource you are creating already
   * exists.
   * Status code 409
   */
  StatusReasonAlreadyExists: 'AlreadyExists',

  /**
   * StatusReasonConflict means the requested operation cannot be completed due
   * to a conflict in the operation. The client may need to alter the request.
   * Each resource may define custom details that indicate the nature of the
   * conflict.
   * Status code 409
   */
  StatusReasonConflict: 'Conflict',

  /**
   * StatusReasonGone means the item is no longer available at the server and no
   * forwarding address is known.
   * Status code 410
   */
  StatusReasonGone: 'Gone',

  /**
   * StatusReasonInvalid means the requested create or update operation cannot
   * be completed due to invalid data provided as part of the request. The
   * client may need to alter the request.
   * Status code 422
   */
  StatusReasonInvalid: 'Invalid',

  /**
   * StatusReasonServerTimeout means the server can be reached and understood
   * the request, but cannot complete the action in a reasonable time. The
   * client should retry the request. This is may be due to temporary server
   * load or a transient communication issue with another server. Status code
   * 500 is used because the HTTP spec provides no suitable server-requested
   * client retry and the 5xx class represents actionable errors.
   * Status code 500
   */
  StatusReasonServerTimeout: 'ServerTimeout',

  /**
   * StatusReasonTimeout means that the request could not be completed within
   * the given time. Clients can get this response only when they specified a
   * timeout param in the request, or if the server cannot complete the
   * operation within a reasonable amount of time. The request might succeed
   * with an increased timeout.
   * Status code 504
   */
  StatusReasonTimeout: 'Timeout',

  /**
   * StatusReasonTooManyRequests means the server experienced too many requests
   * within a given window and that the client must wait to perform the action
   * again. A client may always retry the request that led to this error.
   * Status code 429
   */
  StatusReasonTooManyRequests: 'TooManyRequests',

  /**
   * StatusReasonBadRequest means that the request itself was invalid, because
   * the request doesn't make any sense, for example deleting a read-only
   * object. This is different than StatusReasonInvalid which indicates that the
   * API call could possibly succeed, but the data was invalid. API calls that
   * return BadRequest can never succeed.
   * Status code 400
   */
  StatusReasonBadRequest: 'BadRequest',

  /**
   * StatusReasonMethodNotAllowed means that the action the client attempted to
   * perform on the resource was not supported by the code - for instance,
   * attempting to delete a resource that can only be created. API calls that
   * return MethodNotAllowed can never succeed.
   * Status code 405
   */
  StatusReasonMethodNotAllowed: 'MethodNotAllowed',

  /**
   * StatusReasonNotAcceptable means that the accept types indicated by the
   * client were not acceptable to the server - for instance, attempting to
   * receive protobuf for a resource that supports only json and yaml. API calls
   * that return NotAcceptable can never succeed.
   * Status code 406
   */
  StatusReasonNotAcceptable: 'NotAcceptable',

  /**
   * StatusReasonRequestEntityTooLarge means that the request entity is too
   * large.
   * Status code 413
   */
  StatusReasonRequestEntityTooLarge: 'RequestEntityTooLarge',

  /**
   * StatusReasonUnsupportedMediaType means that the content type sent by the
   * client is not acceptable to the server. API calls that return
   * UnsupportedMediaType can never succeed.
   * Status code 415
   */
  StatusReasonUnsupportedMediaType: 'UnsupportedMediaType',

  /**
   * StatusReasonInternalError indicates that an internal error occurred, it is
   * unexpected and the outcome of the call is unknown.
   * Status code 500
   */
  StatusReasonInternalError: 'InternalError',

  /**
   * StatusReasonExpired indicates that the request is invalid because the
   * content you are requesting has expired and is no longer available. It is
   * typically associated with watches that can't be serviced.
   * Status code 410
   */
  StatusReasonExpired: 'Expired',

  /**
   * StatusReasonServiceUnavailable means that the request itself was valid, but
   * the requested service is unavailable at this time. Retrying the request
   * after some time might succeed.
   * Status code 503
   */
  StatusReasonServiceUnavailable: 'ServiceUnavailable'
};
