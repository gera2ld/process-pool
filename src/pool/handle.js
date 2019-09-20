import { fork } from 'child_process';
import { idFactory, defer } from './util';

const getId = idFactory();

export default class Handle {
  constructor(modulePath) {
    this.id = getId();
    this.process = fork(modulePath);
    this.process.on('message', ({ id, data, error }) => {
      const deferred = this.deferredMap[id];
      if (deferred) {
        if (error) deferred.reject(error);
        else deferred.resolve(data);
        delete this.deferredMap[id];
      }
    });
    this.deferredMap = {};
  }

  getMessageId = idFactory();

  defer(id) {
    const deferred = defer();
    this.deferredMap[id] = deferred;
    return deferred;
  }

  invoke(method, params) {
    if (!params) params = [];
    else if (!Array.isArray(params)) params = [params];
    const id = this.getMessageId();
    const deferred = this.defer(id);
    this.process.send({
      id,
      method,
      params,
    });
    return deferred.promise;
  }

  async drain() {
    for (const deferred of Object.values(this.deferredMap)) {
      try {
        await deferred.promise;
      } catch {
        // ignore
      }
    }
  }

  async destroy() {
    await this.drain();
    this.process.kill();
  }
}
