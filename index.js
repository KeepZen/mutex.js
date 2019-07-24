const Event = require('events');
class Mutex extends Event {
  constructor() {
    super();
    this._waitUnLockMutexes = [];
  }
  async lock() {
    const noNeedWait = this._waitUnLockMutexes.length == 0;
    if (noNeedWait) {
      const mutex = Symbol();
      this._waitUnLockMutexes.push(mutex);
      return;
    } else {
      const len = this._waitUnLockMutexes.length;
      const waitToUnLock = this._waitUnLockMutexes[len - 1];
      if (len < 10) {
        this._waitUnLockMutexes.push(Symbol());
        return new Promise(resolve => {
          this.once(waitToUnLock, resolve);
        })
      } else {
        return new Promise(resolve => {
          this.once(waitToUnLock, () => {
            this._waitUnLockMutexes.push(Symbol());
            resolve();
          })
        })
      }
    }
  }
  unlock() {
    const mutex = this._waitUnLockMutexes.shift();
    this.emit(mutex);
  }
}
function synchronized(fun) {
  const locker = new Mutex();
  return async (...args) => {
    await locker.lock();
    try {
      return await fun(...args);
    } finally {
      locker.unlock();
    }
  }
}
module.exports = {
  Mutex,
  sync: synchronized,
};
