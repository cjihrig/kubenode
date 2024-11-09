declare namespace _exports {
    export { NamedRepository, Reference };
}
declare namespace _exports {
    export { parse };
    export namespace regex {
        export { anchoredDigestRegEx as anchoredDigest };
        export { anchoredIdentifierRegEx as anchoredIdentifier };
        export { anchoredNameRegEx as anchoredName };
        export { anchoredTagRegEx as anchoredTag };
        export { digestRegEx as digest };
        export { domainRegEx as domain };
        export { identifierRegEx as identifier };
        export { nameRegEx as name };
        export { referenceRegEx as reference };
        export { tagRegEx as tag };
    }
}
export = _exports;
type NamedRepository = {
    /**
     * The repository host and port information.
     */
    domain?: string;
    /**
     * The image path.
     */
    path?: string;
};
type Reference = {
    /**
     * Object holding the image host, port, and path information.
     */
    namedRepository: NamedRepository;
    /**
     * The image tag if one exists.
     */
    tag?: string;
    /**
     * The image digest if one exists.
     */
    digest?: string;
};
/**
 * @typedef {Object} NamedRepository
 * @property {string} [domain] The repository host and port information.
 * @property {string} [path] The image path.
 */
/**
 * @typedef {Object} Reference
 * @property {NamedRepository} namedRepository Object holding the image host, port, and path information.
 * @property {string} [tag] The image tag if one exists.
 * @property {string} [digest] The image digest if one exists.
 */
/**
 * parse() splits an image reference into its various components.
 * @param {string} input The image reference string to parse.
 * @returns {Reference}
 */
declare function parse(input: string): Reference;
declare const anchoredDigestRegEx: RegExp;
declare const anchoredIdentifierRegEx: RegExp;
declare const anchoredNameRegEx: RegExp;
declare const anchoredTagRegEx: RegExp;
declare const digestRegEx: RegExp;
declare const domainRegEx: RegExp;
declare const identifierRegEx: RegExp;
declare const nameRegEx: RegExp;
declare const referenceRegEx: RegExp;
declare const tagRegEx: RegExp;
