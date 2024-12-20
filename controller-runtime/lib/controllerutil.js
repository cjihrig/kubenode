export function addFinalizer(o, finalizer) {
  if (containsFinalizer(o, finalizer)) {
    return false;
  }

  o.body.metadata.finalizers ??= [];
  o.body.metadata.finalizers.push(finalizer);
  return true;
}

export function containsFinalizer(o, finalizer) {
  if (!Array.isArray(o.body.metadata.finalizers)) {
    return false;
  }

  return o.body.metadata.finalizers.indexOf(finalizer) !== -1;
}

export function removeFinalizer(o, finalizer) {
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

export default {
  addFinalizer,
  containsFinalizer,
  removeFinalizer
};
