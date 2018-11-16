const {
  Mutex,
}=require("../index.js");

test(
  "lock",
  (done)=>{
    let a = new Mutex();
    let fn = jest.fn(console.log);
    const count = 1000;
    async function step(n,ms){
      await a.lock();
      fn(n,`n:${n},ms:${ms}`);
      if(n == count -1){
        a.emit("done");
      }
      setTimeout(a.unlock.bind(a), ms);
    }
    for(let i=0;i<count;++i){
      const ms = Math.floor(Math.random()*100);
      step(i,ms);
    }

    a.on('done',()=>{
      let calls = fn.mock.calls;
      expect(calls.length).toBe(count);
      expect(calls[0][0]).toBe(0);
      expect(calls[1][0]).toBe(1);
      expect(calls[count-1][0]).toBe(count-1);
      done();
    })
  }
)
