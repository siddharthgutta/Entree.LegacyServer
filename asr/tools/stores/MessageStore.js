/* globals io */
import Influx from 'react-influx';
import Dispatcher from '../Dispatcher.js';
import keyMirror from 'keymirror';

const Events = keyMirror({
  NEW_MESSAGE: null
});

class MessageStore extends Influx.Store {
  constructor() {
    super(Dispatcher);
  }

  getDispatcherListeners() {
    return [
      [Dispatcher, Dispatcher.Events.CONNECT_STREAM, this._onDispatcherConnectStream]
    ];
  }

  _onDispatcherConnectStream() {
    this.socket = io();
    this.socket.on('message', data => this.emit(Events.NEW_MESSAGE, data));
  }
}

export default Influx.Store.construct(MessageStore, Events);
