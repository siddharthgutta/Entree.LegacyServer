import Influx from 'react-influx'
import Dispatcher from '../dispatchers/Dispatcher.js'
import keyMirror from 'keymirror'

const Events = keyMirror({
  ACCOUNT_RECEIVED: null
});

class UserStore extends Influx.Store {
  constructor() {
    super(Dispatcher);
  }

  getDispatcherListeners() {
    return [
      [Dispatcher, Dispatcher.Events.CONNECT_STREAM, this._onDispatcherConnectStream]
    ]
  }

}

export default Influx.Store.construct(UserStore, Events)