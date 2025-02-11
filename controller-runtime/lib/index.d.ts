declare namespace _default {
    export { k8s };
    export { apimachinery };
    export { controllerutil };
    export { Manager };
    export { newControllerManagedBy };
    export { Reconciler };
    export { Request };
    export { Result };
    export { Source };
    export { TerminalError };
    export { webhook };
}
export default _default;
import * as k8s from '@kubernetes/client-node';
export namespace apimachinery {
    export { errors };
    export namespace meta {
        export { metav1 as v1 };
    }
    export { schema };
    export { types };
}
import controllerutil from './controllerutil.js';
import { Manager } from './manager.js';
export const newControllerManagedBy: typeof Builder.controllerManagedBy;
import { Reconciler } from './reconcile.js';
import { Request } from './reconcile.js';
import { Result } from './reconcile.js';
import { Source } from './source.js';
import { TerminalError } from './reconcile.js';
export namespace webhook {
    export { admission };
    export { Server };
}
import errors from './apimachinery/errors.js';
import metav1 from './apimachinery/meta/v1.js';
import schema from './apimachinery/schema.js';
import types from './apimachinery/types.js';
import { Builder } from './builder.js';
import admission from './webhook/admission.js';
import { Server } from './webhook/server.js';
export { k8s, controllerutil, Manager, Reconciler, Request, Result, Source, TerminalError };
