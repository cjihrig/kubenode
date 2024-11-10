import k8s = require("@kubernetes/client-node");
import { Manager } from "./manager";
export const newControllerManagedBy: typeof Builder.controllerManagedBy;
import { Reconciler } from "./reconcile";
import { Request } from "./reconcile";
import { Result } from "./reconcile";
import { Source } from "./source";
import { TerminalError } from "./reconcile";
import { Server } from "./webhook/server";
import { Builder } from "./builder";
export declare namespace apimachinery {
    let errors: typeof import("./apimachinery/errors");
    namespace meta {
        let v1: {
            StatusReasonUnknown: string;
            StatusReasonUnauthorized: string;
            StatusReasonForbidden: string;
            StatusReasonNotFound: string;
            StatusReasonAlreadyExists: string;
            StatusReasonConflict: string;
            StatusReasonGone: string;
            StatusReasonInvalid: string;
            StatusReasonServerTimeout: string;
            StatusReasonTimeout: string;
            StatusReasonTooManyRequests: string;
            StatusReasonBadRequest: string;
            StatusReasonMethodNotAllowed: string;
            StatusReasonNotAcceptable: string;
            StatusReasonRequestEntityTooLarge: string;
            StatusReasonUnsupportedMediaType: string;
            StatusReasonInternalError: string;
            StatusReasonExpired: string;
            StatusReasonServiceUnavailable: string;
        };
    }
    let types: {
        NamespacedName: {
            new (name: string, namespace?: string): {
                name: string;
                namespace: string;
                toString(): string;
            };
        };
        separator: string;
        JSONPatchType: string;
        MergePatchType: string;
        StrategicMergePatchType: string;
        ApplyPatchType: string;
    };
}
export declare let controllerutil: typeof import("./controllerutil");
export declare namespace webhook {
    export let admission: {
        AdmissionReview: {
            new (options: import("./webhook/admission").AdmissionReviewOptions): {
                apiVersion: string;
                kind: string;
                request: {
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
                };
                response: {
                    uid: string;
                    allowed: boolean;
                    status: any;
                    patch: any;
                    patches: any[];
                    patchType: string;
                    auditAnnotations: any;
                    warnings: string[];
                    complete(req: {
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
                    }): void;
                };
            };
        };
        AdmissionRequest: {
            new (options: import("./webhook/admission").AdmissionRequestOptions): {
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
            };
        };
        AdmissionResponse: {
            new (options: import("./webhook/admission").AdmissionResponseOptions): {
                uid: string;
                allowed: boolean;
                status: any;
                patch: any;
                patches: any[];
                patchType: string;
                auditAnnotations: any;
                warnings: string[];
                complete(req: {
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
                }): void;
            };
        };
        GroupName: string;
        OperationConnect: string;
        OperationCreate: string;
        OperationDelete: string;
        OperationUpdate: string;
        PatchTypeJSONPatch: string;
        allowed: (message?: string) => {
            uid: string;
            allowed: boolean;
            status: any;
            patch: any;
            patches: any[];
            patchType: string;
            auditAnnotations: any;
            warnings: string[];
            complete(req: {
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
            }): void;
        };
        denied: (message?: string) => {
            uid: string;
            allowed: boolean;
            status: any;
            patch: any;
            patches: any[];
            patchType: string;
            auditAnnotations: any;
            warnings: string[];
            complete(req: {
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
            }): void;
        };
        errored: (code: number, err?: Error) => {
            uid: string;
            allowed: boolean;
            status: any;
            patch: any;
            patches: any[];
            patchType: string;
            auditAnnotations: any;
            warnings: string[];
            complete(req: {
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
            }): void;
        };
        validationResponse: (allowed: boolean, message?: string) => {
            uid: string;
            allowed: boolean;
            status: any;
            patch: any;
            patches: any[];
            patchType: string;
            auditAnnotations: any;
            warnings: string[];
            complete(req: {
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
            }): void;
        };
    };
    export { Server };
}
export { k8s, Manager, Reconciler, Request, Result, Source, TerminalError };
