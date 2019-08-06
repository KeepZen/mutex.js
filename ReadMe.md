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
Let's just look at the code:

```js
cosnt {Mutex}= require('@keepzen/mutex.js');
const m = new Mutex();

//change step to `async`
async function step(index,ms) {
  await m.lock();// first lock the mutext
  setTimeout(
    ()=>{
      console.log(`index:${index}`);
      m.unlock();// when the work is done unlock the mutext
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

For a locked `mutex`, if you lock it again, you code will blocked.
Some time you just want have a try but if fail do not want be blocked,
now you can use `mutext.try_lock()`. `try_lock` return a boolean,
if it get the change return a `true`, and lock the mutex,
so after you done your work, you shold to unlock the `mutex`.
If it return `false` implicit the mutex have be locked by other,
and you ***MUST* have *NOT*  to `unlock`**  the mutex,
becasue it is not your bussiness.

## `sync()`

This is new for version 0.1.x.

If you like the Java keyword `synchronized`, now you can use in JS like fellow:
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
