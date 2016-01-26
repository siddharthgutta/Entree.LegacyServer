import Influx from 'react-influx'
import keyMirror from 'keymirror'

const Events = keyMirror({
  CONNECT_STREAM: null

});

export default Influx.Dispatcher.construct(Influx.Dispatcher, Events);