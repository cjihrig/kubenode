/**
 * @kubenode
 * @apiVersion unsupported.io/v1
 */
type UndefinedPrimitive = {
  prop: undefined;
};

/**
 * @kubenode
 * @apiVersion unsupported.io/v1
 */
type NullPrimitive = {
  prop: null;
};

/**
 * @kubenode
 * @apiVersion unsupported.io/v1
 */
type SymbolPrimitive = {
  prop: symbol;
};

/**
 * @kubenode
 * @apiVersion unsupported.io/v1
 */
type BigIntPrimitive = {
  prop: bigint;
};

/**
 * @kubenode
 * @apiVersion unsupported.io/v1
 */
type FunctionObject = {
  prop: Function;
};

/**
 * @kubenode
 * @apiVersion unsupported.io/v1
 */
type ArrayOfFunctionObjects = {
  prop: Function[];
};
