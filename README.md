# kubenode

Kubenode is a set of modules and tools for working with Kubernetes in Node.js.

## Quick start guide

This section demonstrates the process of creating a new Kubernetes Custom
Resource Definition (CRD) and corresponding controller using the Kubenode CLI.

Create a project directory:

```sh
mkdir /tmp/kubenode && cd /tmp/kubenode
```

Initialize a new Kubenode project using the following command. This command will
create a number of files and directories in the current directory.

```sh
npx kubenode@latest init -p library-project -d library.io
```

Create scaffolding for a new `Book` resource type using the following command.
This will create several more files and directories containing controller code,
types, and a sample resource that can be applied to your Kubernetes cluster
later. It will also update the existing code to run the new controller.

**Note**: The generated controller is an empty skeleton that runs, but does not
do anything. For the purposes of this guide, it may be helpful to add
`console.log(req)` to the generated `reconcile()` function.

```sh
npx kubenode@latest add api -g library.io -v v1 -k Book
```

Generate a CRD from the types created in the previous step using the following
`codegen` command:

```sh
npx kubenode@latest codegen -g library.io -v v1 -k Book
```

If you have access to a Kubernetes cluster, you can create the new CRD in your
cluster using the following command:

```sh
kubectl apply -f config/crd/library.io_v1_book.yaml
```

The generated controller can be run locally using the following commands:

```sh
npm install
npm start
```

At this point, you can create a new instance of your CRD by applying the
generated sample to the cluster using the following command:

```sh
kubectl apply -f config/samples/library.io_v1_book.yaml
```

If you added a `console.log()` to your controller it should be executed once the
sample resource is created.

## Current packages

- `kubenode` or `@kubenode/kubenode` - The top level module that should be
installed and used. `kubenode` and `@kubenode/kubenode` can be used
interchangeably.
- `@kubenode/cli` - Implementation of the `kubenode` CLI commands.
- `@kubenode/controller-runtime` - APIs used to implement Kubernetes
controllers.
- `@kubenode/crdgen` - APIs for generating CRDs from TypeScript.
- `@kubenode/reference` - Utilities for working with container image references.

## Future goals

- Continue adding missing functionality to the existing APIs.
- Controller client generation.
- Tools for building Kubernetes API extension servers.

## Acknowledgment

This project was heavily inspired by [Kubebuilder](https://book.kubebuilder.io/)
and its subprojects such as [`controller-runtime`](https://github.com/kubernetes-sigs/controller-runtime). Some of the code here has been adapted from
those projects.
