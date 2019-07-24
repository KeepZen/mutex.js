# What's New?
In some scene, there is a hard work need to do between `mutex.lock()` and
`mutex.unlock()`, so lot of `mutxt.lock()` be called, and this may cause
memory exhaustion. I have fixed this bug.

# The origin
We are told: JS is a single process single thread program frame, so in program
with JS we do not need the mutex. But it is not true.

JS run in a single process single thread context, that is true, but not the
frame. JS run in a host program, such as a browser or a node.js process.
The host is multi threads, and some even are multi process.
We say JS is a single thread, it just mean JS parse run in a thread of the
host process.

When JS code have some asynchronous codes, it just mean there have some IPC
between JS parse thread and other host threads.

So if there are some asynchronous codes, there maybe need mutex. Like fellow
example:

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

If you like the Java keyword `synchronized`, now you can use in JS like fellow:
```js
cosnt {
  sync:synchronized
}= require('@keepzen/mutex.js');

//In featch you can use detecotr
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

There is a bug in version **0.0.5** and older. Please update if you use that to last version.
