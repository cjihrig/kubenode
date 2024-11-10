# `@kubenode/controller-runtime`

Utilities for writing Kubernetes controllers in JavaScript.

## Classes

<dl>
<dt><a href="#NamespacedName">NamespacedName</a></dt>
<dd><p>NamespacedName comprises a resource name and namespace rendered as &quot;namespace/name&quot;.</p>
</dd>
<dt><a href="#AdmissionRequest">AdmissionRequest</a></dt>
<dd></dd>
<dt><a href="#AdmissionResponse">AdmissionResponse</a></dt>
<dd></dd>
<dt><a href="#AdmissionReview">AdmissionReview</a></dt>
<dd></dd>
<dt><a href="#Server">Server</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#reasonForError">reasonForError(err)</a> ⇒ <code>string</code></dt>
<dd><p>reasonForError() returns the reason for a particular error.</p>
</dd>
<dt><a href="#isAlreadyExists">isAlreadyExists(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isAlreadyExists() determines if the err is an error which indicates that a
specified resource already exists.</p>
</dd>
<dt><a href="#isBadRequest">isBadRequest(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isBadRequest() determines if err is an error which indicates that the request
is invalid.</p>
</dd>
<dt><a href="#isConflict">isConflict(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isConflict() determines if the err is an error which indicates the provided
update conflicts.</p>
</dd>
<dt><a href="#isForbidden">isForbidden(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isForbidden() determines if err is an error which indicates that the request
is forbidden and cannot be completed as requested.</p>
</dd>
<dt><a href="#isGone">isGone(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isGone() is true if the error indicates the requested resource is no longer
available.</p>
</dd>
<dt><a href="#isInternalError">isInternalError(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isInternalError() determines if err is an error which indicates an internal
server error.</p>
</dd>
<dt><a href="#isInvalid">isInvalid(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isInvalid() determines if the err is an error which indicates the provided
resource is not valid.</p>
</dd>
<dt><a href="#isMethodNotSupported">isMethodNotSupported(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isMethodNotSupported() determines if the err is an error which indicates the
provided action could not be performed because it is not supported by the
server.</p>
</dd>
<dt><a href="#isNotAcceptable">isNotAcceptable(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isNotAcceptable() determines if err is an error which indicates that the
request failed due to an invalid Accept header.</p>
</dd>
<dt><a href="#isNotFound">isNotFound(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isNotFound() determines if an err indicating that a resource could not be
found.</p>
</dd>
<dt><a href="#isRequestEntityTooLargeError">isRequestEntityTooLargeError(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isRequestEntityTooLargeError() determines if err is an error which indicates
the request entity is too large.</p>
</dd>
<dt><a href="#isResourceExpired">isResourceExpired(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isResourceExpired() is true if the error indicates the resource has expired
and the current action is no longer possible.</p>
</dd>
<dt><a href="#isServerTimeout">isServerTimeout(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isServerTimeout() determines if err is an error which indicates that the
request needs to be retried by the client.</p>
</dd>
<dt><a href="#isServiceUnavailable">isServiceUnavailable(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isServiceUnavailable() is true if the error indicates the underlying service
is no longer available.</p>
</dd>
<dt><a href="#isTimeout">isTimeout(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isTimeout() determines if err is an error which indicates that request times
out due to long processing.</p>
</dd>
<dt><a href="#isTooManyRequests">isTooManyRequests(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isTooManyRequests() determines if err is an error which indicates that there
are too many requests that the server cannot handle.</p>
</dd>
<dt><a href="#isUnauthorized">isUnauthorized(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isUnauthorized() determines if err is an error which indicates that the
request is unauthorized and requires authentication by the user.</p>
</dd>
<dt><a href="#isUnsupportedMediaType">isUnsupportedMediaType(err)</a> ⇒ <code>boolean</code></dt>
<dd><p>isUnsupportedMediaType() determines if err is an error which indicates that
the request failed due to an invalid Content-Type header.</p>
</dd>
<dt><a href="#allowed">allowed([message])</a> ⇒ <code><a href="#AdmissionResponse">AdmissionResponse</a></code></dt>
<dd><p>allowed() constructs a response indicating that the given operation is allowed.</p>
</dd>
<dt><a href="#denied">denied([message])</a> ⇒ <code><a href="#AdmissionResponse">AdmissionResponse</a></code></dt>
<dd><p>denied() constructs a response indicating that the given operation is denied.</p>
</dd>
<dt><a href="#errored">errored(code, [err])</a> ⇒ <code><a href="#AdmissionResponse">AdmissionResponse</a></code></dt>
<dd><p>errored() creates a new response for error-handling a request.</p>
</dd>
<dt><a href="#validationResponse">validationResponse(allowed, [message])</a> ⇒ <code><a href="#AdmissionResponse">AdmissionResponse</a></code></dt>
<dd><p>validationResponse() returns a response for admitting a request.</p>
</dd>
<dt><a href="#withResolvers">withResolvers()</a> ⇒ <code><a href="#PromiseWithResolvers">PromiseWithResolvers</a></code></dt>
<dd><p>withResolvers() works like Promise.withResolvers().</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AdmissionRequestOptions">AdmissionRequestOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#AdmissionResponseOptions">AdmissionResponseOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#AdmissionReviewOptions">AdmissionReviewOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#ServerOptions">ServerOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#PromiseWithResolvers">PromiseWithResolvers</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="NamespacedName"></a>

## NamespacedName
NamespacedName comprises a resource name and namespace rendered as "namespace/name".

**Kind**: global class

* [NamespacedName](#NamespacedName)
    * [new NamespacedName(name, [namespace])](#new_NamespacedName_new)
    * [.toString()](#NamespacedName+toString) ⇒ <code>string</code>

<a name="new_NamespacedName_new"></a>

### new NamespacedName(name, [namespace])
Construct a NamespacedName.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Resource name. |
| [namespace] | <code>string</code> | Resource namespace. |

<a name="NamespacedName+toString"></a>

### namespacedName.toString() ⇒ <code>string</code>
Converts a NamespacedName to a string of the form "namespace/name".

**Kind**: instance method of [<code>NamespacedName</code>](#NamespacedName)
**Returns**: <code>string</code> - A string representation of the NamespacedName.
<a name="AdmissionRequest"></a>

## AdmissionRequest
**Kind**: global class
<a name="new_AdmissionRequest_new"></a>

### new AdmissionRequest(options)
Creates a new AdmissionRequest instance.


| Param | Type | Description |
| --- | --- | --- |
| options | [<code>AdmissionRequestOptions</code>](#AdmissionRequestOptions) | Options used to construct instance. |

<a name="AdmissionResponse"></a>

## AdmissionResponse
**Kind**: global class

* [AdmissionResponse](#AdmissionResponse)
    * [new AdmissionResponse(options)](#new_AdmissionResponse_new)
    * [.complete(req)](#AdmissionResponse+complete)

<a name="new_AdmissionResponse_new"></a>

### new AdmissionResponse(options)
Creates a new AdmissionResponse instance.


| Param | Type | Description |
| --- | --- | --- |
| options | [<code>AdmissionResponseOptions</code>](#AdmissionResponseOptions) | Options used to construct instance. |

<a name="AdmissionResponse+complete"></a>

### admissionResponse.complete(req)
complete() populates any fields that are yet to be set in the underlying response.

**Kind**: instance method of [<code>AdmissionResponse</code>](#AdmissionResponse)

| Param | Type | Description |
| --- | --- | --- |
| req | [<code>AdmissionRequest</code>](#AdmissionRequest) | The request corresponding to this response. |

<a name="AdmissionReview"></a>

## AdmissionReview
**Kind**: global class
<a name="new_AdmissionReview_new"></a>

### new AdmissionReview(options)
Creates a new AdmissionReview instance.


| Param | Type | Description |
| --- | --- | --- |
| options | [<code>AdmissionReviewOptions</code>](#AdmissionReviewOptions) | Options used to construct instance. |

<a name="Server"></a>

## Server
**Kind**: global class

* [Server](#Server)
    * [new Server([options])](#new_Server_new)
    * [.inject(settings)](#Server+inject) ⇒ <code>Promise</code>
    * [.register(path, hook)](#Server+register)
    * [.start(ctx)](#Server+start) ⇒ <code>Promise</code>

<a name="new_Server_new"></a>

### new Server([options])
Creates a new Server instance.


| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>ServerOptions</code>](#ServerOptions) | Options used to construct instance. |

<a name="Server+inject"></a>

### server.inject(settings) ⇒ <code>Promise</code>
inject() creates a simulated request in the server.

**Kind**: instance method of [<code>Server</code>](#Server)

| Param | Type | Description |
| --- | --- | --- |
| settings | <code>Object</code> | Simulated request configuration. |

<a name="Server+register"></a>

### server.register(path, hook)
register() marks the given webhook as being served at the given path.

**Kind**: instance method of [<code>Server</code>](#Server)

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The path to serve the webhook from. |
| hook | <code>function</code> | The webhook to serve. |

<a name="Server+start"></a>

### server.start(ctx) ⇒ <code>Promise</code>
start() runs the server.

**Kind**: instance method of [<code>Server</code>](#Server)

| Param | Type | Description |
| --- | --- | --- |
| ctx | <code>Object</code> | The context object. |

<a name="reasonForError"></a>

## reasonForError(err) ⇒ <code>string</code>
reasonForError() returns the reason for a particular error.

**Kind**: global function
**Returns**: <code>string</code> - A StatusReason representing the cause of the error.

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isAlreadyExists"></a>

## isAlreadyExists(err) ⇒ <code>boolean</code>
isAlreadyExists() determines if the err is an error which indicates that a
specified resource already exists.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isBadRequest"></a>

## isBadRequest(err) ⇒ <code>boolean</code>
isBadRequest() determines if err is an error which indicates that the request
is invalid.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isConflict"></a>

## isConflict(err) ⇒ <code>boolean</code>
isConflict() determines if the err is an error which indicates the provided
update conflicts.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isForbidden"></a>

## isForbidden(err) ⇒ <code>boolean</code>
isForbidden() determines if err is an error which indicates that the request
is forbidden and cannot be completed as requested.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isGone"></a>

## isGone(err) ⇒ <code>boolean</code>
isGone() is true if the error indicates the requested resource is no longer
available.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isInternalError"></a>

## isInternalError(err) ⇒ <code>boolean</code>
isInternalError() determines if err is an error which indicates an internal
server error.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isInvalid"></a>

## isInvalid(err) ⇒ <code>boolean</code>
isInvalid() determines if the err is an error which indicates the provided
resource is not valid.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isMethodNotSupported"></a>

## isMethodNotSupported(err) ⇒ <code>boolean</code>
isMethodNotSupported() determines if the err is an error which indicates the
provided action could not be performed because it is not supported by the
server.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isNotAcceptable"></a>

## isNotAcceptable(err) ⇒ <code>boolean</code>
isNotAcceptable() determines if err is an error which indicates that the
request failed due to an invalid Accept header.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isNotFound"></a>

## isNotFound(err) ⇒ <code>boolean</code>
isNotFound() determines if an err indicating that a resource could not be
found.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isRequestEntityTooLargeError"></a>

## isRequestEntityTooLargeError(err) ⇒ <code>boolean</code>
isRequestEntityTooLargeError() determines if err is an error which indicates
the request entity is too large.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isResourceExpired"></a>

## isResourceExpired(err) ⇒ <code>boolean</code>
isResourceExpired() is true if the error indicates the resource has expired
and the current action is no longer possible.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isServerTimeout"></a>

## isServerTimeout(err) ⇒ <code>boolean</code>
isServerTimeout() determines if err is an error which indicates that the
request needs to be retried by the client.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isServiceUnavailable"></a>

## isServiceUnavailable(err) ⇒ <code>boolean</code>
isServiceUnavailable() is true if the error indicates the underlying service
is no longer available.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isTimeout"></a>

## isTimeout(err) ⇒ <code>boolean</code>
isTimeout() determines if err is an error which indicates that request times
out due to long processing.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isTooManyRequests"></a>

## isTooManyRequests(err) ⇒ <code>boolean</code>
isTooManyRequests() determines if err is an error which indicates that there
are too many requests that the server cannot handle.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isUnauthorized"></a>

## isUnauthorized(err) ⇒ <code>boolean</code>
isUnauthorized() determines if err is an error which indicates that the
request is unauthorized and requires authentication by the user.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="isUnsupportedMediaType"></a>

## isUnsupportedMediaType(err) ⇒ <code>boolean</code>
isUnsupportedMediaType() determines if err is an error which indicates that
the request failed due to an invalid Content-Type header.

**Kind**: global function

| Param | Type |
| --- | --- |
| err | <code>Error</code> |

<a name="allowed"></a>

## allowed([message]) ⇒ [<code>AdmissionResponse</code>](#AdmissionResponse)
allowed() constructs a response indicating that the given operation is allowed.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | additional message to attach to the response. |

<a name="denied"></a>

## denied([message]) ⇒ [<code>AdmissionResponse</code>](#AdmissionResponse)
denied() constructs a response indicating that the given operation is denied.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | additional message to attach to the response. |

<a name="errored"></a>

## errored(code, [err]) ⇒ [<code>AdmissionResponse</code>](#AdmissionResponse)
errored() creates a new response for error-handling a request.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| code | <code>number</code> | error code to return. |
| [err] | <code>Error</code> | an error whose message is included in the response. |

<a name="validationResponse"></a>

## validationResponse(allowed, [message]) ⇒ [<code>AdmissionResponse</code>](#AdmissionResponse)
validationResponse() returns a response for admitting a request.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| allowed | <code>boolean</code> | allowed indicates whether or not the admission request was permitted. |
| [message] | <code>string</code> | additional message to attach to the response. |

<a name="withResolvers"></a>

## withResolvers() ⇒ [<code>PromiseWithResolvers</code>](#PromiseWithResolvers)
withResolvers() works like Promise.withResolvers().

**Kind**: global function
<a name="AdmissionRequestOptions"></a>

## AdmissionRequestOptions : <code>Object</code>
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| uid | <code>string</code> | uid is an identifier for the individual request/response. |
| kind | <code>Object</code> | kind is the fully-qualified type of object being submitted. |
| resource | <code>Object</code> | resource is the fully-qualified resource being requested. |
| [subResource] | <code>string</code> | subResource is the subresource being requested, if any. |
| requestKind | <code>Object</code> | requestKind is the fully-qualified type of the original API request |
| requestResource | <code>Object</code> | requestResource is the fully-qualified resource of the original API request. |
| [requestSubResource] | <code>string</code> | requestSubResource is the name of the subresource of the original API request, if any. |
| name | <code>string</code> | name is the name of the object as presented in the request. |
| [namespace] | <code>string</code> | namespace is the namespace associated with the request, if any. |
| operation | <code>string</code> | operation is the operation being performed. |
| userInfo | <code>Object</code> | userInfo is information about the requesting user. |
| object | <code>Object</code> | object is the object from the incoming request. |
| [oldObject] | <code>Object</code> | oldObject is the existing object. Only populated for DELETE and UPDATE requests. |
| [dryRun] | <code>Object</code> | dryRun indicates that modifications will definitely not be persisted for this request. |
| [options] | <code>Object</code> | options is the operation option structure of the operation being performed. |

<a name="AdmissionResponseOptions"></a>

## AdmissionResponseOptions : <code>Object</code>
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [uid] | <code>string</code> | uid is an identifier for the individual request/response. |
| allowed | <code>boolean</code> | allowed indicates whether or not the admission request was permitted. |
| [status] | <code>Object</code> | status contains extra details into why an admission request was denied. |
| [patch] | <code>Object</code> | The patch body. |
| [patches] | <code>Array.&lt;Object&gt;</code> | patches are the JSON patches for mutating webhooks. |
| [auditAnnotations] | <code>Object</code> | auditAnnotations is an unstructured key value map set by remote admission controller |
| [warnings] | <code>Array.&lt;string&gt;</code> | warnings is a list of warning messages to return to the requesting API client. |

<a name="AdmissionReviewOptions"></a>

## AdmissionReviewOptions : <code>Object</code>
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [request] | <code>Object</code> | Object used to create an AdmissionRequest. |
| [response] | <code>Object</code> | Object used to create an AdmissionResponse. |

<a name="ServerOptions"></a>

## ServerOptions : <code>Object</code>
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [certDir] | <code>string</code> | The directory that contains the server key and certificate. |
| [certName] | <code>string</code> | The server certificate name. Defaults to tls.crt. |
| [insecure] | <code>boolean</code> | If true, the server uses HTTP instead of HTTPS. |
| [keyName] | <code>string</code> | The server key name. Defaults to tls.key. |
| [port] | <code>number</code> | The port number that the server will bind to. |
