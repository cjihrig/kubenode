'use strict';
const assert = require('node:assert');
const { test } = require('node:test');
const admission = require('../../lib/webhook/admission');
const fixtures = {
  admissionRequestDelete: {
    uid: '66bea49a-e26d-461d-81d2-4002cfbd7934',
    kind: { group: 'library.io', version: 'v1', kind: 'Book' },
    resource: { group: 'library.io', version: 'v1', resource: 'books' },
    subResource: undefined,
    requestKind: { group: 'library.io', version: 'v1', kind: 'Book' },
    requestResource: { group: 'library.io', version: 'v1', resource: 'books' },
    requestSubResource: undefined,
    name: 'sample-book',
    namespace: 'kubenode',
    operation: 'DELETE',
    userInfo: {
      username: 'minikube-user',
      groups: ['system:authenticated']
    },
    object: null,
    oldObject: {
      apiVersion: 'library.io/v1',
      kind: 'Book',
      metadata: {
        annotations: {},
        creationTimestamp: '2024-10-28T03:09:20Z',
        generation: 1,
        labels: {},
        managedFields: [],
        name: 'sample-book',
        namespace: 'kubenode',
        resourceVersion: '98139',
        uid: '9a9c4d5f-73e0-4602-b2c2-d2506769676c'
      }
    },
    dryRun: false,
    options: {
      kind: 'DeleteOptions',
      apiVersion: 'meta.k8s.io/v1',
      propagationPolicy: 'Background'
    }
  },
  admissionResponseDelete: {
    uid: '66bea49a-e26d-461d-81d2-4002cfbd7934',
    allowed: true,
    status: undefined,
    patch: undefined,
    patches: undefined,
    auditAnnotations: undefined,
    warnings: undefined
  }
};

test('validationResponse() returns allowed response', () => {
  const allowedWithoutMsg = admission.validationResponse(true);
  assert(allowedWithoutMsg instanceof admission.AdmissionResponse);
  assert.strictEqual(allowedWithoutMsg.allowed, true);
  assert.deepStrictEqual(allowedWithoutMsg.status, {
    code: 200, reason: undefined, message: undefined
  });

  const allowedWithMsg = admission.validationResponse(true, 'foo');
  assert(allowedWithMsg instanceof admission.AdmissionResponse);
  assert.strictEqual(allowedWithMsg.allowed, true);
  assert.deepStrictEqual(allowedWithMsg.status, {
    code: 200, reason: undefined, message: 'foo'
  });
});

test('validationResponse() returns forbidden response', () => {
  const forbiddenWithoutMsg = admission.validationResponse(false);
  assert(forbiddenWithoutMsg instanceof admission.AdmissionResponse);
  assert.strictEqual(forbiddenWithoutMsg.allowed, false);
  assert.deepStrictEqual(forbiddenWithoutMsg.status, {
    code: 403, reason: 'Forbidden', message: undefined
  });

  const forbiddenWithMsg = admission.validationResponse(false, 'foo');
  assert(forbiddenWithMsg instanceof admission.AdmissionResponse);
  assert.strictEqual(forbiddenWithMsg.allowed, false);
  assert.deepStrictEqual(forbiddenWithMsg.status, {
    code: 403, reason: 'Forbidden', message: 'foo'
  });
});

test('allowed() returns allowed response', () => {
  const allowedWithoutMsg = admission.allowed();
  assert(allowedWithoutMsg instanceof admission.AdmissionResponse);
  assert.strictEqual(allowedWithoutMsg.allowed, true);
  assert.deepStrictEqual(allowedWithoutMsg.status, {
    code: 200, reason: undefined, message: undefined
  });

  const allowedWithMsg = admission.allowed('foo');
  assert(allowedWithMsg instanceof admission.AdmissionResponse);
  assert.strictEqual(allowedWithMsg.allowed, true);
  assert.deepStrictEqual(allowedWithMsg.status, {
    code: 200, reason: undefined, message: 'foo'
  });
});

test('denied() returns forbidden response', () => {
  const forbiddenWithoutMsg = admission.denied();
  assert(forbiddenWithoutMsg instanceof admission.AdmissionResponse);
  assert.strictEqual(forbiddenWithoutMsg.allowed, false);
  assert.deepStrictEqual(forbiddenWithoutMsg.status, {
    code: 403, reason: 'Forbidden', message: undefined
  });

  const forbiddenWithMsg = admission.denied('foo');
  assert(forbiddenWithMsg instanceof admission.AdmissionResponse);
  assert.strictEqual(forbiddenWithMsg.allowed, false);
  assert.deepStrictEqual(forbiddenWithMsg.status, {
    code: 403, reason: 'Forbidden', message: 'foo'
  });
});

test('errored() returns a disallowed response', () => {
  const erroredWithoutMsg = admission.errored(404);
  assert(erroredWithoutMsg instanceof admission.AdmissionResponse);
  assert.strictEqual(erroredWithoutMsg.allowed, false);
  assert.deepStrictEqual(erroredWithoutMsg.status, {
    code: 404, message: undefined
  });

  const erroredWithMsg = admission.errored(404, new Error('foo'));
  assert(erroredWithMsg instanceof admission.AdmissionResponse);
  assert.strictEqual(erroredWithMsg.allowed, false);
  assert.deepStrictEqual(erroredWithMsg.status, {
    code: 404, message: 'foo'
  });

  const erroredWithMsg2 = admission.errored(404, false);
  assert(erroredWithMsg2 instanceof admission.AdmissionResponse);
  assert.strictEqual(erroredWithMsg2.allowed, false);
  assert.deepStrictEqual(erroredWithMsg2.status, {
    code: 404, message: 'false'
  });
});

test('AdmissionRequest() throws if options are not provided', () => {
  assert.throws(() => {
    // eslint-disable-next-line no-new
    new admission.AdmissionRequest();
  }, /TypeError: options must be an object or boolean/);
});

test('AdmissionRequest() constructor', () => {
  const fixture = fixtures.admissionRequestDelete;
  const req = new admission.AdmissionRequest(fixture);

  assert(req instanceof admission.AdmissionRequest);
  assert.strictEqual(req.uid, fixture.uid);
  assert.deepStrictEqual(req.kind, fixture.kind);
  assert.deepStrictEqual(req.resource, fixture.resource);
  assert.strictEqual(req.subResource, fixture.subResource);
  assert.deepStrictEqual(req.requestKind, fixture.requestKind);
  assert.deepStrictEqual(req.requestResource, fixture.requestResource);
  assert.strictEqual(req.requestSubResource, fixture.requestSubResource);
  assert.strictEqual(req.name, fixture.name);
  assert.strictEqual(req.namespace, fixture.namespace);
  assert.strictEqual(req.operation, fixture.operation);
  assert.deepStrictEqual(req.userInfo, fixture.userInfo);
  assert.strictEqual(req.object, fixture.object);
  assert.deepStrictEqual(req.oldObject, fixture.oldObject);
  assert.strictEqual(req.dryRun, fixture.dryRun);
  assert.deepStrictEqual(req.options, fixture.options);
});

test('AdmissionResponse() throws if options are not provided', () => {
  assert.throws(() => {
    // eslint-disable-next-line no-new
    new admission.AdmissionResponse();
  }, /TypeError: options must be an object or boolean/);
});

test('AdmissionResponse() accepts a boolean as options', () => {
  assert.strictEqual(new admission.AdmissionResponse(true).allowed, true);
  assert.strictEqual(new admission.AdmissionResponse(false).allowed, false);
});

test('AdmissionResponse() throws if options.status is not an object', () => {
  assert.throws(() => {
    // eslint-disable-next-line no-new
    new admission.AdmissionResponse({ status: false });
  }, /TypeError: options.status must be an object/);
});

test('AdmissionResponse() constructor', () => {
  const fixture = fixtures.admissionResponseDelete;
  const res = new admission.AdmissionResponse(fixture);

  assert(res instanceof admission.AdmissionResponse);
  assert.strictEqual(res.uid, fixture.uid);
  assert.strictEqual(res.allowed, fixture.allowed);
  assert.strictEqual(res.status, fixture.status);
  assert.strictEqual(res.patch, fixture.patch);
  assert.strictEqual(res.patches, fixture.patches);
  assert.strictEqual(res.patchType, undefined);
  assert.strictEqual(res.auditAnnotations, fixture.auditAnnotations);
  assert.strictEqual(res.warnings, fixture.warnings);
});

test('AdmissionResponse.p.complete() populates uid from request', () => {
  const req = new admission.AdmissionRequest(fixtures.admissionRequestDelete);
  const res = new admission.AdmissionResponse({});
  assert.strictEqual(res.uid, undefined);
  res.complete(req);
  assert.strictEqual(res.uid, req.uid);
});

test('AdmissionResponse.p.complete() populates status if not set', () => {
  const noStatus = new admission.AdmissionResponse({});
  assert.strictEqual(noStatus.status, undefined);
  noStatus.complete();
  assert.deepStrictEqual(noStatus.status, { code: 200 });

  const withStatus = new admission.AdmissionResponse({ status: { code: 400 } });
  assert.deepStrictEqual(withStatus.status, { code: 400 });
  withStatus.complete();
  assert.deepStrictEqual(withStatus.status, { code: 400 });

  const statusNoCode = new admission.AdmissionResponse({ status: {} });
  assert.deepStrictEqual(statusNoCode.status, {});
  statusNoCode.complete();
  assert.deepStrictEqual(statusNoCode.status, { code: 200 });
});

test('AdmissionResponse.p.complete() populates patch from patches', () => {
  const noPatches = new admission.AdmissionResponse({});
  assert.strictEqual(noPatches.patch, undefined);
  assert.strictEqual(noPatches.patches, undefined);
  assert.strictEqual(noPatches.patchType, undefined);
  noPatches.complete();
  assert.strictEqual(noPatches.patch, undefined);
  assert.strictEqual(noPatches.patches, undefined);
  assert.strictEqual(noPatches.patchType, undefined);

  const emptyPatches = new admission.AdmissionResponse({ patches: [] });
  assert.strictEqual(emptyPatches.patch, undefined);
  assert.deepStrictEqual(emptyPatches.patches, []);
  assert.strictEqual(emptyPatches.patchType, undefined);
  emptyPatches.complete();
  assert.strictEqual(emptyPatches.patch, undefined);
  assert.strictEqual(emptyPatches.patches, undefined);
  assert.strictEqual(emptyPatches.patchType, undefined);

  const patches = [
    { op: 'replace', 'path': '/baz', 'value': 'boo' },
    { op: 'add', 'path': '/hello', 'value': ['world'] },
    { op: 'remove', 'path': '/foo' }
  ];
  const withPatches = new admission.AdmissionResponse({ patches });
  assert.strictEqual(withPatches.patch, undefined);
  assert.deepStrictEqual(withPatches.patches, patches);
  assert.strictEqual(withPatches.patchType, undefined);
  withPatches.complete();
  assert.strictEqual(withPatches.patch, JSON.stringify(patches));
  assert.strictEqual(withPatches.patches, undefined);
  assert.strictEqual(withPatches.patchType, admission.PatchTypeJSONPatch);
});

test('AdmissionReview() throws if options are not provided', () => {
  assert.throws(() => {
    // eslint-disable-next-line no-new
    new admission.AdmissionReview();
  }, /TypeError: options must be an object or boolean/);
});

test('AdmissionReview() constructor', () => {
  const review = new admission.AdmissionReview({
    request: fixtures.admissionRequestDelete,
    response: fixtures.admissionResponseDelete
  });
  assert.strictEqual(review.apiVersion, 'admission.k8s.io/v1');
  assert.strictEqual(review.kind, 'AdmissionReview');
  assert.strictEqual(review.request.uid, fixtures.admissionRequestDelete.uid);
  assert.strictEqual(review.response.uid, fixtures.admissionResponseDelete.uid);

  const noReqReview = new admission.AdmissionReview({
    response: fixtures.admissionResponseDelete
  });
  assert.strictEqual(noReqReview.apiVersion, 'admission.k8s.io/v1');
  assert.strictEqual(noReqReview.kind, 'AdmissionReview');
  assert.strictEqual(noReqReview.request, undefined);
  assert.strictEqual(
    noReqReview.response.uid, fixtures.admissionResponseDelete.uid
  );

  const noResReview = new admission.AdmissionReview({
    request: fixtures.admissionRequestDelete
  });
  assert.strictEqual(noResReview.apiVersion, 'admission.k8s.io/v1');
  assert.strictEqual(noResReview.kind, 'AdmissionReview');
  assert.strictEqual(
    noResReview.request.uid, fixtures.admissionRequestDelete.uid
  );
  assert.strictEqual(noResReview.response, undefined);
});
