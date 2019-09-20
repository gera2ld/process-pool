import { defer } from './util';
import Handle from './handle';

export default class Pool {
  constructor(size, modulePath) {
    this.size = size;
    this.modulePath = modulePath;
    this.handles = {
      all: [],
      available: [],
      busy: new Set(),
    };
    this.waiting = [];
  }

  async get() {
    let handle = this.handles.available.shift();
    if (!handle) {
      if (this.handles.all.length < this.size) {
        handle = new Handle(this.modulePath);
        this.handles.all.push(handle);
      } else {
        const deferred = defer();
        this.waiting.push(deferred);
        handle = await deferred.promise;
      }
    }
    this.handles.busy.add(handle);
    return handle;
  }

  put(handle) {
    const deferred = this.waiting.shift();
    if (deferred) {
      deferred.resolve(handle);
    } else {
      this.handles.busy.delete(handle);
      this.handles.available.push(handle);
    }
  }

  async invoke(method, params) {
    const handle = await this.get();
    try {
      const result = await handle.invoke(method, params);
      return result;
    } finally {
      this.put(handle);
    }
  }

  async destroy() {
    for (const handle of this.handles.all) {
      await handle.destroy();
    }
  }
}