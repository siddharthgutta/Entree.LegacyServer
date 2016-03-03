import Influx from 'react-influx';
import keyMirror from 'keymirror';

// @formatter:off
const Events = keyMirror({
  CONNECT: null,
  DISCONNECTED: null,
  CONNECTED: null,
  SELECT_USER: null
});
// @formatter:on

export default Influx.Dispatcher.construct(Influx.Dispatcher, Events);
