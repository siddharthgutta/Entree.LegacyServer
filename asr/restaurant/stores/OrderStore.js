import Influx from 'react-influx'
import Dispatcher from '../dispatchers/Dispatcher.js'
import keyMirror from 'keymirror'
import moment from 'moment'

const Events = keyMirror({
  ORDER_RECEIVED: null
});

const sampleData = [
  {
    id: 1,
    phone: '713-505-1837',
    name: 'Tiraj Parikh',
    cost: Number((Math.random() * 50).toFixed(2)),
    items: [],
    status: 'NEW'
  }, {
    id: 2,
    phone: '713-505-1837',
    name: 'Calvin Bench',
    cost: Number((Math.random() * 50).toFixed(2)),
    items: [],
    status: 'ACCEPTED'
  }, {
    id: 3,
    phone: '713-505-1837',
    name: 'Kevin Fu',
    cost: Number((Math.random() * 50).toFixed(2)),
    items: [],
    status: 'NEW'
  }
];

class OrderStore extends Influx.Store {
  constructor() {
    super(Dispatcher);

    this.data.orders = [];
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
        const nextOrder = sampleData[parseInt(Math.random() * sampleData.length)];
        nextOrder.id = Date.now();
        nextOrder.time = Date.now();
        this.data.order.push(nextOrder);
        this.emit(Events.ORDER_RECEIVED, nextOrder);
      }, parseInt(Math.random() * 4000));
    }, 10000)
  }
}

export default Influx.Store.construct(OrderStore, Events)