import Influx from 'react-influx';
import Dispatcher from '../dispatchers/Dispatcher.js';
import keyMirror from 'keymirror';
import extend from 'extend';
import Chance from 'chance';
import _ from 'underscore';

const Events = keyMirror({
  ORDER_RECEIVED: null,
  ORDER_UPDATED: null
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

  getDispatcherListeners() {
    return [
      [Dispatcher, Dispatcher.Events.CONNECT_STREAM, this._onDispatcherConnectStream]
    ];
  }

  getOrders() {
    return this.data.orders;
  }

  injectTestOrder() {
    const order = extend({}, sampleData[parseInt(Math.random() * sampleData.length, 10)]);
    order.id = ++counter;
    order.name = chance.name();
    order.date = Date.now();
    order.cost = Number((Math.random() * 50).toFixed(2));
    order.status = chance.pick(['received', 'accepted', 'completed']);

    this.data.orders.unshift(order);

    this.emit(Events.ORDER_RECEIVED, order);
    this.emit(Events.ORDER_UPDATED, order);

    return order;
  }

  fetchOrderById(id) {
    id = parseInt(id, 10);

    if (id) {
      const {orders} = this.data;
      const idx = _.findIndex(orders, {id});

      if (idx > -1) {
        return orders[idx];
      }
    }

    return {
      id: 'NA',
      cost: 0,
      status: 'loading',
      name: 'loading'
    };
  }

  off(type, listener) {
    return super.removeListener(type, listener);
  }

  _onDispatcherConnectStream() {
    for (let i = 0; i < 20; i++) {
      this.injectTestOrder();
    }

    setInterval(() => {
      setTimeout(() => {
        this.injectTestOrder();
      }, parseInt(Math.random() * 500, 10));
    }, 5000);
  }
}

export default Influx.Store.construct(OrderStore, Events);
