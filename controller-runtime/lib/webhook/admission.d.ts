declare namespace _exports {
    export { AdmissionRequestOptions, AdmissionResponseOptions, AdmissionReviewOptions };
}
declare namespace _exports {
    export { AdmissionReview };
    export { AdmissionRequest };
    export { AdmissionResponse };
    export { kGroupName as GroupName };
    export { kOperationConnect as OperationConnect };
    export { kOperationCreate as OperationCreate };
    export { kOperationDelete as OperationDelete };
    export { kOperationUpdate as OperationUpdate };
    export { kPatchTypeJSONPatch as PatchTypeJSONPatch };
    export { allowed };
    export { denied };
    export { errored };
    export { validationResponse };
}
export = _exports;
type AdmissionRequestOptions = {
    /**
     * uid is an identifier for the individual request/response.
     */
    uid: string;
    /**
     * kind is the fully-qualified type of object being submitted.
     */
    kind: any;
    /**
     * resource is the fully-qualified resource being requested.
     */
    resource: any;
    /**
     * subResource is the subresource being requested, if any.
     */
    subResource?: string;
    /**
     * requestKind is the fully-qualified type of the original API request
     */
    requestKind: any;
    /**
     * requestResource is the fully-qualified resource of the original API request.
     */
    requestResource: any;
    /**
     * requestSubResource is the name of the subresource of the original API request, if any.
     */
    requestSubResource?: string;
    /**
     * name is the name of the object as presented in the request.
     */
    name: string;
    /**
     * namespace is the namespace associated with the request, if any.
     */
    namespace?: string;
    /**
     * operation is the operation being performed.
     */
    operation: string;
    /**
     * userInfo is information about the requesting user.
     */
    userInfo: any;
    /**
     * object is the object from the incoming request.
     */
    object: any;
    /**
     * oldObject is the existing object. Only populated for DELETE and UPDATE requests.
     */
    oldObject?: any;
    /**
     * dryRun indicates that modifications will definitely not be persisted for this request.
     */
    dryRun?: any;
    /**
     * options is the operation option structure of the operation being performed.
     */
    options?: any;
};
type AdmissionResponseOptions = {
    /**
     * uid is an identifier for the individual request/response.
     */
    uid?: string;
    /**
     * allowed indicates whether or not the admission request was permitted.
     */
    allowed: boolean;
    /**
     * status contains extra details into why an admission request was denied.
     */
    status?: any;
    /**
     * The patch body.
     */
    patch?: any;
    /**
     * patches are the JSON patches for mutating webhooks.
     */
    patches?: any[];
    /**
     * auditAnnotations is an unstructured key value map set by remote admission controller
     */
    auditAnnotations?: any;
    /**
     * warnings is a list of warning messages to return to the requesting API client.
     */
    warnings?: string[];
};
type AdmissionReviewOptions = {
    /**
     * Object used to create an AdmissionRequest.
     */
    request?: any;
    /**
     * Object used to create an AdmissionResponse.
     */
    response?: any;
};
declare class AdmissionReview {
    /**
     * Creates a new AdmissionReview instance.
     * @param {AdmissionReviewOptions} options Options used to construct instance.
     */
    constructor(options: AdmissionReviewOptions);
    apiVersion: string;
    kind: string;
    request: AdmissionRequest;
    response: AdmissionResponse;
}
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
declare class AdmissionRequest {
    /**
     * Creates a new AdmissionRequest instance.
     * @param {AdmissionRequestOptions} options Options used to construct instance.
     */
    constructor(options: AdmissionRequestOptions);
    uid: string;
    kind: any;
    resource: any;
    subResource: string;
    requestKind: any;
    requestResource: any;
    requestSubResource: string;
    name: string;
    namespace: string;
    operation: string;
    userInfo: any;
    object: any;
    oldObject: any;
    dryRun: any;
    options: any;
}
declare class AdmissionResponse {
    /**
     * Creates a new AdmissionResponse instance.
     * @param {AdmissionResponseOptions} options Options used to construct instance.
     */
    constructor(options: AdmissionResponseOptions);
    uid: string;
    allowed: boolean;
    status: any;
    patch: any;
    patches: any[];
    patchType: string;
    auditAnnotations: any;
    warnings: string[];
    /**
     * complete() populates any fields that are yet to be set in the underlying response.
     * @param {AdmissionRequest} req The request corresponding to this response.
     */
    complete(req: AdmissionRequest): void;
}
declare const kGroupName: "admission.k8s.io";
declare const kOperationConnect: "CONNECT";
declare const kOperationCreate: "CREATE";
declare const kOperationDelete: "DELETE";
declare const kOperationUpdate: "UPDATE";
declare const kPatchTypeJSONPatch: "JSONPatch";
/**
 * allowed() constructs a response indicating that the given operation is allowed.
 * @param {string} [message] additional message to attach to the response.
 * @returns {AdmissionResponse}
 */
declare function allowed(message?: string): AdmissionResponse;
/**
 * denied() constructs a response indicating that the given operation is denied.
 * @param {string} [message] additional message to attach to the response.
 * @returns {AdmissionResponse}
 */
declare function denied(message?: string): AdmissionResponse;
/**
 * errored() creates a new response for error-handling a request.
 * @param {number} code error code to return.
 * @param {Error} [err] an error whose message is included in the response.
 * @returns {AdmissionResponse}
 */
declare function errored(code: number, err?: Error): AdmissionResponse;
/**
 * validationResponse() returns a response for admitting a request.
 * @param {boolean} allowed allowed indicates whether or not the admission request was permitted.
 * @param {string} [message] additional message to attach to the response.
 * @returns {AdmissionResponse}
 */
declare function validationResponse(allowed: boolean, message?: string): AdmissionResponse;
