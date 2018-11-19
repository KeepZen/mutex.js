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

```
index:0
index:1
index:2
....
```
We need mutex.
# Install
+ npm `npm install @keepzen/mutex.js`
+ yarn `yarn add @keepzen/mutex.js`

# API
Let's just look at the code:

```js
cosnt Mutext = require('@keepzen/mutex.js');
const m = new Mutext();

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
