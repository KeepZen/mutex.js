const {
  Mutex,
  sync: synchronized
} = require("./index.js");

test(
  "lock",
  (done) => {
    jest.setTimeout(60 * 1000)
    let a = new Mutex();
    let fn = jest.fn(console.log);
    const count = 10;
    async function step(n, ms) {
      await a.lock();
      fn(n, `n:${n},ms:${ms}`);
      if (n == count - 1) {
        a.emit("done");
      }
      setTimeout(a.unlock.bind(a), ms);
    }
    for (let i = 0; i < count; ++i) {
      const ms = Math.floor(Math.random() * 10);
      step(i, ms);
    }

    a.on('done', () => {
      let calls = fn.mock.calls;
      expect(calls.length).toBe(count);
      expect(calls[0][0]).toBe(0);
      expect(calls[1][0]).toBe(1);
      expect(calls[count - 1][0]).toBe(count - 1);
      done();
    })
  }
)
async function sleep(n) {
  return new Promise(resolve => {
    setTimeout(resolve, n);
  });
}
test('synchronized(fun)', async () => {
  let ret = [];
  let ps = [];
  const fn = async (n) => {
    let ms = Math.floor(Math.random() * 10);
    await sleep(ms);
    ret.push(n);
  }
  for (let i = 0; i < 10; ++i) {
    ps.push(fn(i));
  }
  await Promise.all(ps);
  expect(ret).not.toMatchObject([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const synFn = synchronized(fn);
  ret = [], ps = [];
  for (let i = 0; i < 10; ++i) {
    ps.push(synFn(i));
  }
  await Promise.all(ps);
  expect(ret).toMatchObject([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
})
