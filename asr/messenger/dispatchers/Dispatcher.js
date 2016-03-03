import Influx from 'react-influx';
import keyMirror from 'keymirror';

// @formatter:off
const Events = keyMirror({
  LOGIN: null,
  CONNECTION_STATUS: null,
  SELECT_USER: null
});
// @formatter:on

export default Influx.Dispatcher.construct(Influx.Dispatcher, Events);
