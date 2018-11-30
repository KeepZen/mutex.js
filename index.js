const Event = require('events');

class Mutex extends Event {
  constructor(){
      super();
      this._events = [];
  }
  async lock(){
    const event = this._events[0];
    this._events.push(Symbol());
    if(event == undefined){
      return;
    }else{
      return new Promise(
        resolve =>{
          this.once(event, resolve);
        }
      );
    }
  }
  unlock(){
    let event = this._events.shift();
    console.log(event);
    if(event !== undefined ){
      this.emit(event);
    }
  }
}
module.exports={
  Mutex,
};
