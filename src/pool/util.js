export function defer() {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}

export function idFactory() {
  let id = 0;
  return () => {
    id += 1;
    return id;
  };
}
