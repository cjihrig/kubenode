import { Controller } from './controller.js';
import { Reconciler } from './reconcile.js';
import { Source } from './source.js';

export class Builder {
  constructor(manager) {
    this.manager = manager;
    this.name = '';
    this.forInput = null;
    this.ownsInput = [];
  }

  build(reconciler) {
    if (!(reconciler instanceof Reconciler)) {
      throw new TypeError('reconciler must be a Reconciler instance');
    }

    const ctrlName = this.#getControllerName();
    const controller = new Controller(ctrlName, { reconciler });
    this.manager.add(controller);
    this.#setupControllerWatches(controller);
    return controller;
  }

  complete(reconciler) {
    this.build(reconciler);
  }

  for(kind, apiVersion) {
    if (this.forInput !== null) {
      throw new Error('for() can only be called once');
    }

    this.forInput = { kind, apiVersion };
    return this;
  }

  named(name) {
    this.name = name;
    return this;
  }

  owns(kind, apiVersion) {
    this.ownsInput.push({ kind, apiVersion });
    return this;
  }

  watches() {
    return this;
  }

  static controllerManagedBy(manager) {
    return new Builder(manager);
  }

  #getControllerName() {
    if (this.name) {
      return this.name;
    }

    if (this.forInput) {
      return this.forInput.kind.toLowerCase();
    }

    throw new Error('controller has no name. for() or named() must be called');
  }

  #setupControllerWatches(ctrl) {
    if (this.forInput !== null) {
      const src = new Source(
        this.manager.kubeconfig,
        this.manager.client,
        this.forInput.kind,
        this.forInput.apiVersion
      );
      ctrl.watch(src);
    }
  }
}

export default { Builder };
