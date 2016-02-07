import Influx from 'react-influx';
import keyMirror from 'keymirror';

const Events = keyMirror({
  CONNECT: null,
  SELECT_USER: null
});

export default Influx.Dispatcher.construct(Influx.Dispatcher, Events);
