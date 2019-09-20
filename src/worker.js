class Worker {
  constructor() {
    this.handler = {};
  }

  setHandler(handler) {
    this.handler = Object.create(handler);
  }

  setMethod(name, method) {
    this.handler[name] = method;
  }
}

const worker = new Worker();

export default worker;

process.on('message', async ({ id, method, params }) => {
  let data;
  let error;
  try {
    data = await worker.handler[method](...params);
  } catch (err) {
    error = `${err}` || 'Unknown error';
  }
  process.send({ id, data, error });
});
