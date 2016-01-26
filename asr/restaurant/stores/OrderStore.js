import Influx from 'react-influx'
import Dispatcher from '../dispatchers/Dispatcher.js'
import keyMirror from 'keymirror'
import moment from 'moment'
import extend from 'extend'
import Chance from 'chance'

const Events = keyMirror({
  ORDER_RECEIVED: null
});

const chance = new Chance();

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

  injectTestOrder() {
    const order = extend({}, sampleData[parseInt(Math.random() * sampleData.length)]);
    order.id = ++counter;
    order.name = chance.name();
    order.date = Date.now();
    order.cost = Number((Math.random() * 50).toFixed(2));
    order.status = chance.pick(["received", "accepted", "completed", "declined"]);

    this.data.orders.unshift(order);
    this.emit(Events.ORDER_RECEIVED, order);

    return order;
  }

  _onDispatcherConnectStream() {
    for (var i = 0; i < 20; i++) {
      this.injectTestOrder();
    }

    setInterval(()=> {
      setTimeout(()=> {
        this.injectTestOrder();
      }, parseInt(Math.random() * 500));
    }, 5000)
  }
}

export default Influx.Store.construct(OrderStore, Events)