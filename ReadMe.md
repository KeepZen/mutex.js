![npm](https://img.shields.io/npm/v/@keepzen/mutex.js)
![npm](https://img.shields.io/npm/dm/@keepzen/mutex.js)
![npm](https://img.shields.io/npm/dt/@keepzen/mutex.js)
# The origin
We are told: Js is a single process single thread program frame, so programing
with Js we do not need mutex. But it is not true.

Js run in a single process single thread context, that is true, but not the
frame. Js run in a host context, such as a browser or a node.js process.
The host is multi threads, and some even are multi processes.
We say Js is a single thread, it just mean Js parser run in a thread of the
host processes.

When Js have some asynchronous codes, it mean there are some IPC
between Js parser thread and other host threads/processes.

So if there are some asynchronous codes, maybe mutex are required.

# API
## `mutex.lock()`

`lock()` return a `Promsie<Symbol>`, the symbol is the `key` use in `unlock(key)`.

Mutex like a lock and nobody can unlock the locked lock if do not have a `key`, at least for `@keepzen/mutex.js` this is always true.

Let's just look at code:

```js
cosnt {Mutex}= require('@keepzen/mutex.js');
const m = new Mutex();

async function step(index,ms) {
  const key=await m.lock();// first lock the mutex
  setTimeout(
    ()=>{
      console.log(`index:${index}`);
      m.unlock(key);// when the work is done unlock with the `key`.
    },
    ms
  );
  //Warning: when program run in there,
  //the work is not done, so there is not
  //the place to unlock the mutex.
}
for(let i=0;i<1000;++i){
  let ms = Math.floor(Math.random()*1000);
  step(i,ms);
}
```

## `mutex.try_lock()`

Return a symbol or null.

For a locked `mutex`, if you lock it again, you code will be blocked.
Sometime maybe you just want to have a try but do not want be blocked if fail,
`mutext.try_lock()` is for this.

`try_lock` return a symbol as the key if success. After you done your work, you should unlock the `mutex` with this key, such as `mutext.unlock(key)`.

If `try_lock` return `null` implicit the mutex have be locked by other.

## `unlock(key)`
After you done your work, you must unlock the `mutex` with the `key` which get from the `lock` or `try_lock`.

## `sync()`

`sync` just like Java keyword `synchronized`, you can use it as fellow:
```js
cosnt {
  sync:synchronized
}= require('@keepzen/mutex.js');

//In future you can use `synchronized` as decorate
//@synconized
function step(index,ms){
  setTimeout(()=>{
    console.log(`index:${index}`);
  },ms);
}
const syncStep = synchronized(step);
for(let i=0;i<1000;++i){
  let ms = Math.floor(Math.random()*1000);
  syncStep(i,ms);
}
```
