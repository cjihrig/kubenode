# kubenode

Kubenode is a set of modules and tools for working with Kubernetes in Node.js.

## Current modules

- `kubenode` or `@kubenode/kubenode` - The top level module that should be
installed and used.
- `@kubenode/cli` - Implementation of the `kubenode` CLI commands.
- `@kubenode/controller-runtime` - APIs used to implement Kubernetes
controllers.
- `@kubenode/crdgen` - APIs for generating Kubernetes Custom Resource
Definitions (CRDs) from TypeScript.

## Future goals

- Continue adding missing functionality to the existing APIs.
- Controller client generation.
- Tools for building Kubernetes API extension servers.

## Acknowledgment

This project was heavily inspired by [Kubebuilder](https://book.kubebuilder.io/)
and its subprojects such as [`controller-runtime`](https://github.com/kubernetes-sigs/controller-runtime). Some of the code here has been adapted from
those projects.
