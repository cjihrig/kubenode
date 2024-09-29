'use strict';

function addFinalizer(o, finalizer) {
  if (containsFinalizer(o, finalizer)) {
    return false;
  }

  o.body.metadata.finalizers ??= [];
  o.body.metadata.finalizers.push(finalizer);
  return true;
}

function containsFinalizer(o, finalizer) {
  if (!Array.isArray(o.body.metadata.finalizers)) {
    return false;
  }

  return o.body.metadata.finalizers.indexOf(finalizer) !== -1;
}

function removeFinalizer(o, finalizer) {
  if (!Array.isArray(o.body.metadata.finalizers)) {
    return false;
  }

  const index = o.body.metadata.finalizers.indexOf(finalizer);

  if (index === -1) {
    return false;
  }

  o.body.metadata.finalizers.splice(index, 1);
  return true;
}

module.exports = {
  addFinalizer,
  containsFinalizer,
  removeFinalizer
};
