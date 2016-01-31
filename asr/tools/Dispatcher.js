import Influx from 'react-influx';
import keyMirror from 'keymirror';

const Events = keyMirror({

  // prepend "REQUEST" on UI events; convention allows for POST/PRE events
  REQUEST_SIDEBAR_VISIBILITY: null,

  CONNECT_STREAM: null

});

export default Influx.Dispatcher.construct(Influx.Dispatcher, Events);
