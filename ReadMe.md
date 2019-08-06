For Version 0.2.0

# The origin
We are told: JS is a single process single thread program frame, so programing
with JS we do not need the mutex. But it is not true.

JS run in a single process single thread context, that is true, but not the
frame. JS run in a host context, such as a browser or a node.js process.
The host is multi threads, and some even are multi process.
We say JS is a single thread, it just mean JS parser run in a thread of the
host process.

When JS code have some asynchronous codes, it just mean there have some IPC
between JS parser thread and other host threads/processes.

So if there are some asynchronous codes, there maybe need mutex. Such as fellow
examples:

```js
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
We need mutex.

# API
## `mutex.lock()`

`lock()` return a `Promsie<Symbol>`, the symbol is the `key` use in `unlock(key)`.

Nobody can unlock if do not have the `key`.

Let's just look at the code:

```js
cosnt {Mutex}= require('@keepzen/mutex.js');
const m = new Mutex();

//change step to `async`
async function step(index,ms) {
  const key=await m.lock();// first lock the mutext
  setTimeout(
    ()=>{
      console.log(`index:${index}`);
      m.unlock(key);// when the work is done unlock the mutext
    },
    ms
  );
  //Warning: when program run in there,
  //the work is not done, so there is not
  //the place to unlock the mutext.
}
for(let i=0;i<1000;++i){
  let ms = Math.floor(Math.random()*1000);
  step(i,ms);
}
```

## `mutex.try_lock()`
This is new after version 0.1.3.

Return a symbol or null.

For a locked `mutex`, if you lock it again, you code will blocked.
Some time you just want have a try but if fail do not want be blocked,
now you can use `mutext.try_lock()`.

`try_lock` return a symbol as the key, if it can get, and lock the mutex. After you done your work, you shold to unlock the `mutex`, and give back the key, use `mutext.unlock(key)`.

If `try_lock` return `null` implicit the mutex have be locked by other.

If do not have the `key`, nobody can unlock the mutex, so from version 0.2.0 you do not need to care unintended `unlock`.

## `unlock(key)`
After you done your work, you must unlock the `mutex` with the `key` which get from the `lock` or `try_lock`.

## `sync()`

This is new for version 0.1.x.

`sync` is just like Java keyword `synchronized`, you can use it as fellow:
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
# TIPS

There is a serious bug in version **0.0.5**, and I am very sorry for that. Please upgread to laset version if you use version **0.0.5**.
