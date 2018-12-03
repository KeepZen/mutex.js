const Event = require('events');

function lockMutex(m,event,resolve){
  if(m._events.length < 10){
    m._events.push( Symbol('lock') );
    m.once(event,resolve);
  }else{
    //retry after 0.5 seconde
    setTimeout(lockMutex.bind(null,m,event,resolve), 500);
  }
}

class Mutex extends Event {
  constructor(){
      super();
      const events = [];
      this._events = events;
  }

  async lock(){
    const event = this._events[0];
    if(event == undefined){
      return;
    }else{
      return new Promise(
        resolve => {
          lockMutex(this,event,resolve);
        }
      );
    }
  }
  unlock(){
    let event = this._events.shift();
    if(event !== undefined ){
      this.emit(event);
    }
  }
}
module.exports={
  Mutex,
};
