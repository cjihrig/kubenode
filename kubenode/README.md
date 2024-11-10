# kubenode

Kubenode is a set of modules and tools for working with Kubernetes in Node.js.

## Quick start guide

This section demonstrates the process of creating a new Kubernetes Custom
Resource Definition (CRD) and corresponding controller using the Kubenode CLI.

Initialize a new Kubenode project using the following command. This command will
create a number of files and directories in the current directory.

```sh
mkdir /tmp/kubenode
cd /tmp/kubenode
npx kubenode init -p library-project -d library.io
```

Create scaffolding for a new `Book` resource type using the following command.
This will create several more files and directories containing controller code,
types, and a sample resource that can be applied to your Kubernetes cluster
later. It will also update the existing code to run the new controller.

**Note**: The generated controller is an empty skeleton that runs, but does not
do anything. For the purposes of this guide, it may be helpful to add
`console.log(req)` to the generated `reconcile()` function.

```sh
npx kubenode add api -g library.io -v v1 -k Book
```

Generate a CRD from the types created in the previous step using the following
`codegen` command:

```sh
npx kubenode codegen -g library.io -v v1 -k Book
```

Add a validating webhook for the new `Book` type via the following command:

```sh
npx kubenode add webhook -g library.io -v v1 -k Book -a
```

### Build and deploy

The generated resources need to be built into an image and pushed to a registry.
In order to do this, the image needs a name. The resources are scaffolded with
an image reference of `controller:latest`. You will need to decide on an image
name of your own. The following command configures the project to use an image
reference of `localhost:5000/controller`. You should substitute your own image
reference instead.

```sh
npx kubenode configure manager-image localhost:5000/controller
```

Build the image and push it to the registry using the following command:

```sh
npm run docker-build
npm run docker-push
```

Deploy the generated system using the following command:

```sh
npm run deploy
```

At this point, you can create a new instance of your CRD by applying the
generated sample to the cluster using the following command:

```sh
kubectl apply -f config/samples/library.io_v1_book.yaml
```

If you added a `console.log()` to your controller it should be executed once the
sample resource is created. You can view the logs via the following command:

```sh
kubectl logs -n kubenode deployment/controller-manager -f
```

### Cleanup

The system can be torn down using the following command:

```sh
npm run undeploy
```

## CLI commands

### `kubenode add api`

Generates resources for a new CRD.

Flags:

- `-g`, `--group` (string) - The API group of the CRD. **Required**.
- `-k`, `--kind` (string) - The Kind of the CRD. **Required**.
- `-v`, `--version` (string) - The API version of the CRD. **Required**.
- `-w`, `--directory` (string) - The working directory for the command.
  **Default:** `process.cwd()`.

### `kubenode add webhook`

Generates resources for validating and mutating webhooks.

Flags:

- `-a`, `--validating` - If present, a validating webhook is scaffolded.
  **Default:** A validating webhook is not created.
- `-g`, `--group` (string) - The API group of the CRD. **Required**.
- `-k`, `--kind` (string) - The Kind of the CRD. **Required**.
- `-m`, `--mutating` - If present, a mutating webhook is scaffolded.
  **Default:** A mutating webhook is not created.
- `-v`, `--version` (string) - The API version of the CRD. **Required**.
- `-w`, `--directory` (string) - The working directory for the command.
  **Default:** `process.cwd()`.

### `kubenode codegen`

Generates configuration files for a CRD that was previously created via the
`kubenode add api` command.

Flags:

- `-g`, `--group` (string) - The API group of the CRD. **Required**.
- `-k`, `--kind` (string) - The Kind of the CRD. **Required**.
- `-v`, `--version` (string) - The API version of the CRD. **Required**.
- `-w`, `--directory` (string) - The working directory for the command.
  **Default:** `process.cwd()`.

### `kubenode configure manager-image IMAGE_REFERENCE`

Sets the project's image reference to be `IMAGE_REFERENCE`.

Flags:

- `-w`, `--directory` (string) - The working directory for the command.
  **Default:** `process.cwd()`.

### `kubenode init`

Initializes a new project.

Flags:

- `-d`, `--domain` (string) - Domain for CRDs in the project. **Required**.
- `-p`, `--project-name` (string) - The project name. **Default:** The name of
  the current directory.
- `-w`, `--directory` (string) - The working directory for the command.
  **Default:** `process.cwd()`.

## Available packages

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
