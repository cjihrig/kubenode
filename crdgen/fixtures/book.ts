/**
 * @kubenode
 * @apiVersion library.io/v1
 * @kind Book
 * @scope cluster
 * @plural books
 * @singular book
 * @description Schema for the books API
 */

/**
 * Another comment, which kubenode ignores.
 */
type Book = {
  /**
   * @description apiVersion defines the versioned schema of this representation
   * of an object. Servers should convert recognized schemas to the latest
   * internal value, and may reject unrecognized values.
   */
  apiVersion: string;

  /**
   * @description kind is a string value representing the REST resource this
   * object represents.
   */
  kind: string;

  /**
   * @description metadata is a standard Kubernetes object for metadata.
   */
  metadata: object;

  /**
   * @description spec defines the desired state of Book.
   */
  spec: BookSpec;
};

type BookSpec = {
  title: string;
};
