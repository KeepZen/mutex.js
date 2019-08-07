For Version 0.2.0

# The origin
We are told: Js is a single process single thread program frame, so programing
with Js we do not need mutex. But it is not true.

Js run in a single process single thread context, that is true, but not the
frame. Js run in a host context, such as a browser or a node.Js process.
The host is multi threads, and some even are multi processes.
We say Js is a single thread, it just mean Js parser run in a thread of the
host processes.

When Js have some asynchronous codes, it mean there are some IPC
between Js parser thread and other host threads/processes.

So if there are some asynchronous codes, maybe mutex are required. Such as fellow example:

```Js
function step(index,ms){
  setTimeout(
    ()=>{
      console.log(`index:${index}`);
    },
    ms
  );
}
for(let i=0;i<1000;++i){
  let ms = Math.floor(Math.random()*1000);
  step(i,ms);
}
```
If we want the console output like that:

```txt
index:0
index:1
index:2
....
```
Mutex can help us.

# API
## `mutex.lock()`

`lock()` return a `Promsie<Symbol>`, the symbol is the `key` use in `unlock(key)`.

Mutex like a lock and nobody can unlock the locked lock if do not have a `key`, at least for `@keepzen/mutex.Js` this is always true.

Let's just look at code:

```Js
cosnt {Mutex}= require('@keepzen/mutex.Js');
const m = new Mutex();

//change step to `async`
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
Sometime maybe you just want to have a try but if fail do not want be blocked,
now you can use `mutext.try_lock()` to do that.

`try_lock` return a symbol as the key if the try success. After you done your work, you should  unlock the `mutex` with the key, as `mutext.unlock(key)`.

If `try_lock` return `null` implicit the mutex have be locked by other.

If do not have the `key`, nobody can unlock the mutex, so from version 0.2.0 you do not need to care unintended `unlock`.

## `unlock(key)`
After you done your work, you must unlock the `mutex` with the `key` which get from the `lock` or `try_lock`.

## `sync()`

`sync` is just like Java keyword `synchronized`, you can use it as fellow:
```Js
cosnt {
  sync:synchronized
}= require('@keepzen/mutex.Js');

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
