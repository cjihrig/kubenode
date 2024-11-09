# `@kubenode/crdgen`

Utilities for creating Kubernetes CRDs from TypeScript definitions.

## Classes

<dl>
<dt><a href="#Model">Model</a></dt>
<dd><p>Class representing a single custom resource model.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#generateModelsFromFiles">generateModelsFromFiles(filenames)</a> ⇒ <code>Map.&lt;string, Model&gt;</code></dt>
<dd><p>Generates models defined in a collection of files.</p>
</dd>
<dt><a href="#getModelConfigFromComments">getModelConfigFromComments([jsDocs])</a> ⇒ <code><a href="#ModelCommentConfig">ModelCommentConfig</a></code></dt>
<dd><p>Extracts a model configuration from JSDoc comments.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ModelCommentConfig">ModelCommentConfig</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ModelCRD">ModelCRD</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="Model"></a>

## Model
Class representing a single custom resource model.

**Kind**: global class

* [Model](#Model)
    * [new Model(program, node, config)](#new_Model_new)
    * [.toCRD()](#Model+toCRD) ⇒ [<code>ModelCRD</code>](#ModelCRD)

<a name="new_Model_new"></a>

### new Model(program, node, config)
Construct a model.


| Param | Type | Description |
| --- | --- | --- |
| program | <code>ts.Program</code> | TypeScript API Program. |
| node | <code>ts.TypeAliasDeclaration</code> | TypeScript API TypeAliasDeclaration node. |
| config | [<code>ModelCommentConfig</code>](#ModelCommentConfig) | Model configuration extracted from JSDoc comments. |

<a name="Model+toCRD"></a>

### model.toCRD() ⇒ [<code>ModelCRD</code>](#ModelCRD)
Converts the Model to a CRD object that can be stringified to YAML.

**Kind**: instance method of [<code>Model</code>](#Model)
**Returns**: [<code>ModelCRD</code>](#ModelCRD) - An object representation of the Model as a Kubernetes CRD.
<a name="generateModelsFromFiles"></a>

## generateModelsFromFiles(filenames) ⇒ <code>Map.&lt;string, Model&gt;</code>
Generates models defined in a collection of files.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| filenames | <code>Array.&lt;string&gt;</code> | The files to extract models from. |

<a name="getModelConfigFromComments"></a>

## getModelConfigFromComments([jsDocs]) ⇒ [<code>ModelCommentConfig</code>](#ModelCommentConfig)
Extracts a model configuration from JSDoc comments.

**Kind**: global function

| Param | Type |
| --- | --- |
| [jsDocs] | <code>Array.&lt;any&gt;</code> |

<a name="ModelCommentConfig"></a>

## ModelCommentConfig : <code>object</code>
**Kind**: global typedef
**Properties**

| Name | Type |
| --- | --- |
| apiVersion | <code>string</code> |
| description | <code>string</code> |
| kind | <code>string</code> |
| isNamespaced | <code>boolean</code> |
| plural | <code>string</code> |
| singular | <code>string</code> |

<a name="ModelCRD"></a>

## ModelCRD : <code>object</code>
**Kind**: global typedef
**Properties**

| Name | Type |
| --- | --- |
| apiVersion | <code>string</code> |
| kind | <code>string</code> |
| metadata | <code>object</code> |
| spec | <code>object</code> |
