const Event = require('events');
class Mutex extends Event {
  constructor() {
    super();
    this._waitToUnlockMutex = null;
  }
  try_lock() {
    if (this._waitToUnlockMutex) {
      return null;
    } else {
      return this._waitToUnlockMutex = Symbol();
    }
  }
  unlock(mutex) {
    if (mutex && mutex == this._waitToUnlockMutex) {
      this._waitToUnlockMutex = null;
    }
    if (mutex != null) {
      this.emit(mutex);
    }
  }

  async lock() {
    let mutex = this.try_lock();
    if (mutex != null) {
      return mutex;
    } else {
      const waitToUnlock = this._waitToUnlockMutex;
      const thisMutex = this._waitToUnlockMutex = Symbol();
      return new Promise(resolve => {
        this.once(waitToUnlock, () => resolve(thisMutex));
      });
    }
  }
}

function synchronized(fun) {
  const locker = new Mutex();
  const args = new Array(fun.length).fill('x').map((x, i) => x + i).join(",")
  const code = `(async function ${fun.name}_sync( ${args} ){
     const key=await locker.lock();
     try{
       return await fun(...arguments);
     }finally{
       locker.unlock(key);
     }
  })`
  return eval(code);
}
module.exports = {
  Mutex,
  sync: synchronized,
};
