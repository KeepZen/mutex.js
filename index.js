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
      const mutex = Symbol();
      this._waitToUnlockMutex = mutex;
      return mutex;
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
      let waitToUnlock, thisMutex = Symbol();
      [waitToUnlock, this._waitToUnlockMutex] = [this._waitToUnlockMutex, thisMutex];
      return new Promise(resolve => {
        this.once(waitToUnlock, () => resolve(thisMutex));
      });
    }
  }
}

function synchronized(fun) {
  const locker = new Mutex();
  return async (...args) => {
    const mu = await locker.lock();
    try {
      return await fun(...args);
    } finally {
      locker.unlock(mu);
    }
  }
}
module.exports = {
  Mutex,
  sync: synchronized,
};
