import Influx from 'react-influx';
import keyMirror from 'keymirror';

const Events = keyMirror({
  CONNECT_STREAM: null,
  REQUEST_HEADER: null,
  REGISTER_MODAL: null,
  UNREGISTER_MODAL: null,
  MODAL_VISIBILITY: null,
  MENU_VISIBILITY: null
});

export default Influx.Dispatcher.construct(Influx.Dispatcher, Events);
