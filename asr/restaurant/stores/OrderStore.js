import Influx from 'react-influx'
import Dispatcher from '../dispatchers/Dispatcher.js'
import keyMirror from 'keymirror'
import moment from 'moment'
import extend from 'extend'

const Events = keyMirror({
  ORDER_RECEIVED: null
});

const sampleData = [
  {
    id: 1,
    phone: '713-505-1837',
    name: 'Tiraj Parikh',
    items: [],
    status: 'NEW'
  }, {
    id: 2,
    phone: '713-505-1837',
    name: 'Calvin Bench',
    items: [],
    status: 'ACCEPTED'
  }, {
    id: 3,
    phone: '713-505-1837',
    name: 'Kevin Fu',
    items: [],
    status: 'NEW'
  }
];

let counter = 0;

class OrderStore extends Influx.Store {
  constructor() {
    super(Dispatcher);

    this.data = {orders: []};

    window.orders = this.data.orders;
  }

  sendStatus(id, status) {

  }

  getDispatcherListeners() {
    return [
      [Dispatcher, Dispatcher.Events.CONNECT_STREAM, this._onDispatcherConnectStream]
    ]
  }

  getOrders() {
    return this.data.orders;
  }

  _onDispatcherConnectStream() {
    setInterval(()=> {
      setTimeout(()=> {
        const nextOrder = extend({}, sampleData[parseInt(Math.random() * sampleData.length)]);
        nextOrder.id = ++counter;
        nextOrder.date = Date.now();
        nextOrder.cost = Number((Math.random() * 50).toFixed(2));
        this.data.orders.unshift(nextOrder);
        this.emit(Events.ORDER_RECEIVED, nextOrder);
      }, parseInt(Math.random() * 500));
    }, 5000)
  }
}

export default Influx.Store.construct(OrderStore, Events)