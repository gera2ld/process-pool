# @gera2ld/process-pool

`process-pool` allows you to do CPU expensive stuff in multiple processes to make use of multiple CPU cores.

## Usage

Assume we have a `main.js` and `worker.js` like this:

```js
// main.js
const Pool = require('@gera2ld/process-pool');

(async () => {
  const pool = new Pool(3, `${__dirname}/worker.js`);

  const [result1, result2] = await Promise.all([
    pool.invoke('add', [1, 2]),
    pool.invoke('minus', [4, 3]),
  ]);
  console.log(result1, result2);

  await pool.destroy();
})();
```

```js
// worker.js
const worker = require('@gera2ld/process-pool/lib/worker');

class Handler {
  add(a, b) {
    return a + b;
  }
}

// Set a handler with preset methods
worker.setHandler(new Handler());

// Add other methods
worker.setMethod('minus', (a, b) => a - b);
```
