# `@kubenode/reference`

Utilities for working with container image references.

## Functions

<dl>
<dt><a href="#parse">parse(input)</a> ⇒ <code><a href="#Reference">Reference</a></code></dt>
<dd><p>parse() splits an image reference into its various components.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#NamedRepository">NamedRepository</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#Reference">Reference</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="parse"></a>

## parse(input) ⇒ [<code>Reference</code>](#Reference)
parse() splits an image reference into its various components.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | The image reference string to parse. |

<a name="NamedRepository"></a>

## NamedRepository : <code>Object</code>
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [domain] | <code>string</code> | The repository host and port information. |
| [path] | <code>string</code> | The image path. |

<a name="Reference"></a>

## Reference : <code>Object</code>
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| namedRepository | [<code>NamedRepository</code>](#NamedRepository) | Object holding the image host, port, and path information. |
| [tag] | <code>string</code> | The image tag if one exists. |
| [digest] | <code>string</code> | The image digest if one exists. |

## Acknowledgment

This package was adapted from the Golang
[`distribution/reference`](https://pkg.go.dev/github.com/distribution/reference)
package.
