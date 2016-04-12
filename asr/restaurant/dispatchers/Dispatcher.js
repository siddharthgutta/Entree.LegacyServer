import Influx from 'react-influx';
import keyMirror from 'keymirror';

// @formatter:off
const Events = keyMirror({
  LOGIN: null,
  LOGOUT: null,
  CONNECTION_STATUS: null,
  REQUEST_HEADER: null,
  REGISTER_MODAL: null,
  UNREGISTER_MODAL: null,
  MODAL_VISIBILITY: null,
  MENU_VISIBILITY: null,
  FEEDBACK: null
});
// @formatter:on

export default Influx.Dispatcher.construct(Influx.Dispatcher, Events);
