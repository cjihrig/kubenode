
'use strict';
const kRepositoryNameTotalLengthMax = 255;

const alphanumeric = '[a-z0-9]+';
const digestPat = '[A-Za-z][A-Za-z0-9]*(?:[-_+.][A-Za-z][A-Za-z0-9]*)*[:][0-9A-Fa-f]{32,}';
const domainNameComponent = '(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])';
const identifier = '([a-f0-9]{64})';
const ipv6address = '\\[(?:[a-fA-F0-9:]+)\\]';
const optionalPort = '(?::[0-9]+)?';
const separator = '(?:[._]|__|[-]+)';
const tag = '[\\w][\\w.-]{0,127}';

const domainName = domainNameComponent + anyTimes('\\.' + domainNameComponent);
const host = '(?:' + domainName + '|' + ipv6address + ')';
const domainAndPort = host + optionalPort;
const pathComponent = alphanumeric + anyTimes(separator, alphanumeric);
const remoteName = pathComponent + anyTimes('/', pathComponent);
const namePat = optional(domainAndPort, '/') + remoteName;
const referencePat = anchored(capture(namePat), optional(':', capture(tag)), optional('@', capture(digestPat)));

const anchoredDigestRegEx = new RegExp(anchored(digestPat));
const anchoredIdentifierRegEx = new RegExp(anchored(identifier));
const anchoredNameRegEx = new RegExp(anchored(optional(capture(domainAndPort), '/'), capture(remoteName)));
const anchoredTagRegEx = new RegExp(anchored(tag));
const digestRegEx = new RegExp(digestPat);
const domainRegEx = new RegExp(domainAndPort);
const identifierRegEx = new RegExp(identifier);
const nameRegEx = new RegExp(namePat);
const referenceRegEx = new RegExp(referencePat);
const tagRegEx = new RegExp(tag);

function anchored(...strings) {
  return '^' + strings.join('') + '$';
}

function anyTimes(...strings) {
  return '(?:' + strings.join('') + ')*';
}

function capture(...strings) {
  return '(' + strings.join('') + ')';
}

function optional(...strings) {
  return '(?:' + strings.join('') + ')?';
}

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
function parse(input) {
  if (typeof input !== 'string') {
    throw new TypeError('input must be a string');
  }

  const match = referenceRegEx.exec(input);

  if (match === null) {
    if (input === '') {
      throw new Error('repository name must have at least one component');
    }

    if (referenceRegEx.test(input.toLowerCase())) {
      throw new Error('repository name must be lowercase');
    }

    throw new Error('invalid reference format');
  }

  const nameMatch = anchoredNameRegEx.exec(match[1]);
  const reference = {
    namedRepository: {
      domain: undefined,
      path: undefined
    },
    tag: match[2],
    digest: undefined
  };

  if (nameMatch.length === 3) {
    reference.namedRepository.domain = nameMatch[1];
    reference.namedRepository.path = nameMatch[2];
  } else {
    reference.namedRepository.domain = '';
    reference.namedRepository.path = match[1];
  }

  if (reference.namedRepository.path.length > kRepositoryNameTotalLengthMax) {
    throw new RangeError('repository name must not be more than ' +
      `${kRepositoryNameTotalLengthMax} characters`);
  }

  if (match[3] !== undefined) {
    reference.digest = match[3];
  }

  return reference;
}

module.exports = {
  parse,
  regex: {
    anchoredDigest: anchoredDigestRegEx,
    anchoredIdentifier: anchoredIdentifierRegEx,
    anchoredName: anchoredNameRegEx,
    anchoredTag: anchoredTagRegEx,
    digest: digestRegEx,
    domain: domainRegEx,
    identifier: identifierRegEx,
    name: nameRegEx,
    reference: referenceRegEx,
    tag: tagRegEx
  }
};
