import Influx from 'react-influx';
import Dispatcher from '../dispatchers/Dispatcher.js';
import keyMirror from 'keymirror';
import fetch from '../../libs/fetch';
import {format} from 'url';
import config from '../../libs/config';
import io from 'socket.io-client';
import {SocketEvents} from '../../../api/constants/client.es6';
import _ from 'underscore';

// @formatter:off
export const Events = keyMirror({
  READY: null,
  ORDER_RECEIVED: null,
  ORDER_UPDATED: null,
  RESTAURANT_UPDATED: null
});

export const Status = keyMirror({
  CONNECTING: null,
  CONNECTED: null,
  DISCONNECTED: null
});
// @formatter:on

const SERVER_URL = format(config.get('Server'));
// TODO extract to UserStore

class OrderStore extends Influx.Store {
  constructor() {
    super(Dispatcher);

    this.data = {orders: [], status: Status.DISCONNECTED};

    document.addEventListener('resume', () => {
      console.log('Resuming!');
    }, false);

    document.addEventListener('deviceready', () => {
      if (window.cordova) {
        window.cordova.plugins.notification.local.hasPermission(granted => {
          if (!granted) {
            return window.cordova.plugins.notification
                         .local.registerPermission(_granted => this.data.granted = _granted);
          }

          this.data.granted = granted;
        });

        window.cordova.plugins.backgroundMode.enable();
        window.cordova.plugins.backgroundMode.setDefaults({text: 'Listening for orders'});
      }
    }, false);

    this._login();
  }

  getDispatcherListeners() {
    return [
      [Dispatcher, Dispatcher.Events.LOGIN, this._login]
    ];
  }

  _notify(title, text) {
    if (window.cordova) {
      const sound = window.device.platform === 'Android' ? 'file://sound.mp3' : 'file://beep.caf';
      const notification = {
        id: Date.now(),
        title,
        text,
        message: text,
        at: new Date(),
        sound
      };

      window.cordova.plugins.notification.local.schedule(notification);
    }
  }

  getOrders(status) {
    console.log(this.data.orders, status);
    return status ? this.data.orders.filter(order => order.status === status) : this.data.orders;
  }

  // TODO extract UserStore, RestaurantStore
  async fetchRestaurantInfo() {
    const {body: {data: {restaurant}}} =
      await fetch(`${SERVER_URL}/api/v2/restaurant/info`, {
        body: {token: this.data.token}
      });

    this.emit(Events.RESTAURANT_UPDATED, restaurant);

    return restaurant;
  }

  // TODO extract UserStore, RestaurantStore
  async setRestaurantEnabled(enabled) {
    const {body: {data: {restaurant}}} =
      await fetch(`${SERVER_URL}/api/v2/restaurant/enabled`, {
        method: 'post',
        body: {token: this.data.token, enabled}
      });

    this.emit(Events.RESTAURANT_UPDATED, restaurant);

    return restaurant;
  }

  async setOrderStatus(id, status, {prepTime, message}) {
    const {body: {data: {order}}} =
      await fetch(`${SERVER_URL}/api/v2/restaurant/order/${id}/status`, {
        method: 'post',
        body: {
          token: this.data.token,
          status,
          prepTime,
          message
        }
      });

    return order;
  }

  async fetchOrderById(id) {
    const {body: {data: {order}}} =
      await fetch(`${SERVER_URL}/api/v2/restaurant/order/${id}`, {body: {token: this.data.token}});

    this._addOrder(order);

    this.emit(Events.ORDER_UPDATED, order);

    return order;
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

  getTotalCost(order) {
    return order.Items.reduce((memo, item) => item.price + memo, 0);
  }

  async _login(id, password) {
    let token = localStorage.getItem('token');

    this.data.token = token;

    if (token) {
      this._setConnectionStatus(Status.CONNECTING);

      try {
        await fetch(`${SERVER_URL}/api/v2/restaurant/connection`, {body: {token}});
      } catch (e) {
        console.error(e);
        token = null;
        localStorage.removeItem('token');
        return this._setConnectionStatus(Status.DISCONNECTED, e.message);
      }

      this._setConnectionStatus(Status.CONNECTED);
    }

    if (id && password) {
      this._setConnectionStatus(Status.CONNECTING);

      try {
        token = await this._connect(id, password);
        this.data.token = token;
        localStorage.setItem('token', token);
      } catch (e) {
        console.error(e);
        return this._setConnectionStatus(Status.DISCONNECTED, e.message);
      }

      this._setConnectionStatus(Status.CONNECTED);
    }

    if (this.data.status === Status.CONNECTED) {
      try {
        await this._fetchOrders(token);
      } catch (e) {
        console.error(e);
      }

      this.emit(Events.READY, this.data.orders);

      const {socket} = this.data;
      if (!socket || (socket && !socket.connected)) {
        try {
          this.data.socket = await this._startStream(token);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  async logout() {
    const {token} = this.data;

    this.data.token = null;

    localStorage.removeItem('token');

    if (token) {
      try {
        await fetch(`${SERVER_URL}/api/v2/restaurant/logout`, {method: 'post', body: {token}});
      } catch (e) {
        // ignore
      }
    }

    return this._setConnectionStatus(Status.DISCONNECTED, 'Logged out');
  }

  async _fetchOrders(token) {
    try {
      const {body: {data: {orders}}} =
        await fetch(`${SERVER_URL}/api/v2/restaurant/orders`, {body: {token}});

      this._addOrder(orders);
    } catch (e) {
      // ignore
    }
  }

  async _startStream(token) {
    const {body: {data: {address, uuid}}} = await fetch(`${SERVER_URL}/api/v2/restaurant/socket`, {
      method: 'post',
      body: {token}
    });

    const socket = io(format(address), {query: `id=${uuid}`, secure: true});

    socket.on(SocketEvents.NEW_ORDER, order => {
      this._addOrder(order);
      this._notify('New order', `From ${order.User.firstName}`);
      this.emit(Events.ORDER_RECEIVED, order);
    });

    socket.on(SocketEvents.ORDER_UPDATE, order => {
      this._addOrder(order);
      this._notify('Updated order', `From ${order.User.firstName}`);
      this.emit(Events.ORDER_UPDATED, order);
    });

    socket.on('alive?', (data, respond) => respond({status: 'ok'}));

    return socket;
  }

  getConnectionStatus() {
    return this.data.status;
  }

  async _connect(id, password) {
    const {body: {data: {token}}} = await fetch(`${SERVER_URL}/api/v2/restaurant/login`, {
      method: 'post',
      body: {id, password}
    });

    return token;
  }
}

export default Influx.Store.construct(OrderStore, Events);
