import Influx from 'react-influx';
import Dispatcher from '../dispatchers/Dispatcher.js';
import keyMirror from 'keymirror';
import {format} from 'url';
import config from '../../libs/config';
import RESTaurant from '../../libs/RESTaurant.es6';
import _ from 'underscore';
import * as env from '../../libs/env.es6';

// @formatter:off
export const Events = keyMirror({
  READY: null,
  ORDER_RECEIVED: null,
  ORDER_UPDATED: null,
  RESTAURANT_UPDATED: null,
  ORDERS_UPDATED: null,
  HISTORY_UPDATED: null
});

export const Status = keyMirror({
  CONNECTING: null,
  CONNECTED: null,
  DISCONNECTED: null
});
// @formatter:on

const server = config.get('Server');
const SERVER_URL = format({...server, ...{port: server.overridePort || server.port}});

class OrderStore extends Influx.Store {
  constructor() {
    super(Dispatcher);

    this.data = {
      orders: [],
      history: [],
      status: Status.DISCONNECTED,
      restaurant: new RESTaurant(SERVER_URL, localStorage.getItem('token'))
    };

    document.addEventListener('resume', () => {
      this.fetchRestaurantInfo();
      this.refreshActiveOrders();
    }, false);

    const {restaurant} = this.data;

    restaurant.on(RESTaurant.Events.CONNECTING, message => {
      this._setConnectionStatus(Status.CONNECTING, message);
    });

    restaurant.on(RESTaurant.Events.CONNECTED, async token => {
      window.localStorage.setItem('token', token);

      await restaurant.stream();

      const orders = await restaurant.orders();
      orders.forEach(order => this._addOrder(order));

      this._setConnectionStatus(Status.CONNECTED);

      this.emit(Events.READY);

      // env.setBackground(true);
    });

    restaurant.on(RESTaurant.Events.DISCONNECTED, () => {
      window.localStorage.removeItem('token');

      this._setConnectionStatus(Status.DISCONNECTED);

      this.data.orders = [];

      // env.setBackground(false);
    });

    restaurant.on(RESTaurant.Events.NEW_ORDER, order => {
      this._addOrder(order);
      this.emit(Events.ORDER_RECEIVED, order);

      if (!env.isNative()) {
        const cost = this.getTotalCost(order).toFixed(2);

        env.notify(`New Order Received`, `Order #${order.id2}: ${order.User.firstName} paid $${cost}`);
      } else {
        env.playSound();
      }
    });

    restaurant.on(RESTaurant.Events.ORDER_UPDATE, order => {
      this._addOrder(order);
      this.emit(Events.ORDER_UPDATED, order);
      // env.notify('Updated order', `From ${order.User.firstName}`);
    });

    restaurant.on(RESTaurant.Events.RESTAURANT_UPDATED, _restaurant => {
      this.emit(Events.RESTAURANT_UPDATED, _restaurant);
    });

    const token = window.localStorage.getItem('token');

    restaurant.connect({token});
  }

  getDispatcherListeners() {
    return [
      [Dispatcher, Dispatcher.Events.LOGIN, this._onDispatcherLogin],
      [Dispatcher, Dispatcher.Events.LOGOUT, this._onDispatcherLogout],
      [Dispatcher, Dispatcher.Events.FEEDBACK, this._onDispatcherFeedback]
    ];
  }

  async refreshActiveOrders() {
    const orders = await this.data.restaurant.orders();

    this.data.orders = [];

    orders.forEach(order => this._addOrder(order));

    this.emit(Events.ORDERS_UPDATED);
  }

  async _onDispatcherLogout() {
    const {restaurant} = this.data;

    restaurant.disconnect();
  }

  async _onDispatcherFeedback(content) {
    const {restaurant} = this.data;

    return restaurant.feedback(content);
  }

  async _onDispatcherLogin(id, password) {
    const {restaurant} = this.data;

    await restaurant.connect({credentials: {id, password}});
  }

  _setConnectionStatus(status) {
    this.data.status = status;

    Dispatcher.emit(Dispatcher.Events.CONNECTION_STATUS, status);
  }

  _addOrder(order) {
    let {orders} = this.data;

    if (Array.isArray(order)) {
      order.forEach(a => a.updatedAt = new Date(a.updatedAt));
      orders = orders.concat(order);
    } else if (typeof order === 'object') {
      order.updatedAt = new Date(order.updatedAt);
      orders.push(order);
    } else {
      return orders;
    }

    orders = _.values(_.indexBy(orders, 'id'));
    orders.sort((a, b) => b.updatedAt - a.updatedAt);

    this.data.orders = orders;

    return orders;
  }

  async fetchOrderById(id) {
    const order = await this.data.restaurant.order(id);
    this._addOrder(order);
    this.emit(Events.ORDER_UPDATED, order);
    return order;
  }

  async fetchRestaurantInfo() {
    const restaurant = await this.data.restaurant.info();
    this.emit(Events.RESTAURANT_UPDATED, restaurant);
    return restaurant;
  }

  async fetchOrderHistory(status) {
    const history = await this.data.restaurant.history(status);
    this.data.history = history;
    this.emit(Events.HISTORY_UPDATED, history);
    return this.data.history;
  }

  async setRestaurantEnabled(enabled) {
    return await this.data.restaurant.enabled(enabled);
  }

  async setOrderStatus(id, status, {prepTime, message}) {
    const order = await this.data.restaurant.order(id, status, {prepTime, message});
    this._addOrder(order);
    this.emit(Events.ORDER_UPDATED, order);
    return order;
  }

  getHistory(status) {
    return status ? this.data.history.filter(order => order.status === status).sort((a, b) => b.updatedAt - a.updatedAt)
      : this.data.history;
  }

  getOrders(status) {
    return status ? this.data.orders.filter(order => order.status === status) : this.data.orders;
  }

  getTotalCost(order) {
    return order.Items.reduce((memo, item) => item.price + memo, 0) / 100;
  }

  getFirstName(order) {
    if (order) {
      return order.User ? order.User.firstName || 'None' : 'Deleted';
    }

    return '';
  }

  getLastName(order) {
    if (order) {
      return order.User ? order.User.lastName || 'None' : 'Deleted';
    }

    return '';
  }

  getConnectionStatus() {
    return this.data.status;
  }
}

export default Influx.Store.construct(OrderStore, Events);
