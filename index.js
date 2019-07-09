const Event = require('events');

function lockMutex(m, waitToDone, resolve) {
  if (m._events.length < 10) {
    let newSignal = Symbol('lock');
    m._events.push(newSignal);
    m.once(waitToDone, resolve);
  } else {
    //retry after 0.05 seconde
    setTimeout(lockMutex.bind(null, m, waitToDone, resolve), 50);
  }
}

class Mutex extends Event {
  constructor() {
    super();
    this._signals = [];
  }

  async lock() {
    const waitToDone = this._signals[0];
    if (waitToDone == undefined) {
      return;
    } else {
      return new Promise(
        resolve => {
          lockMutex(this, waitToDone, resolve);
        }
      );
    }
  }
  unlock() {
    let doneSignal = this._signals.shift();
    if (doneSignal !== undefined) {
      this.emit(doneSignal);
    }
  }
}
module.exports = {
  Mutex,
};
