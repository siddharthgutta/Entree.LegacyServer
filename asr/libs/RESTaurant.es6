import EventEmitter from 'events';
import io from 'socket.io-client';
import {format} from 'url';
import fetch from './fetch.es6';
import _ from 'underscore';
import {SocketEvents} from '../../api/constants/client.es6';

const beat = (data, respond) => respond({status: 'ok'});

class RESTaurant extends EventEmitter {

  static Events = {
    CONNECTING: 'REST/CONNECTING',
    CONNECTED: 'REST/CONNECTED',
    DISCONNECTED: 'REST/DISCONNECTED',
    NEW_ORDER: `REST/${SocketEvents.NEW_ORDER}`,
    ORDER_UPDATE: `REST/${SocketEvents.ORDER_UPDATE}`,
    RESTAURANT_STATUS: `REST/${SocketEvents.RESTAURANT_STATUS}`,
    RESTAURANT_UPDATED: `REST/${SocketEvents.RESTAURANT_UPDATED}`
  };

  token = null;
  socket = null;
  emitter = null;
  server = null;

  constructor(server, token) {
    super();

    this._server = server;
    this._token = token;
    this._limit = 50;
    this._socket = null;
    this._activeOrders = [];
    this._inactiveOrders = [];
  }

  _emit(...args) {
    super.emit(...args);
  }

  async connect({token, credentials: {id, password} = {}}) {
    this._emit(RESTaurant.Events.CONNECTING, false);

    if (token) {
      this._token = token;

      if (await this.connected()) {
        this._emit(RESTaurant.Events.CONNECTED, token);

        return token;
      }
    }

    if (id && password && !(await this.connected())) {
      try {
        const {body: {data: {token: _token}}} = await fetch(`${this._server}/api/v2/restaurant/login`, {
          method: 'post', body: {id, password}
        });

        this._token = _token;
        this._emit(RESTaurant.Events.CONNECTED, _token);

        return _token;
      } catch (e) {
        this._emit(RESTaurant.Events.DISCONNECTED, false);

        throw e;
      }
    }

    this._emit(RESTaurant.Events.DISCONNECTED, false);
  }

  async disconnect() {
    if (this._socket) {
      try {
        this._socket.disconnect();
      } catch (e) {
        // ignore
      }

      this._socket = null;
    }

    try {
      if (this._token) {
        await fetch(`${this._server}/api/v2/restaurant/logout`, {method: 'post', body: {token: this._token}});
      }
    } catch (e) {
      this._token = null;
      this._emit(RESTaurant.Events.DISCONNECTED, false);

      throw e;
    }

    this._token = null;
    this._emit(RESTaurant.Events.DISCONNECTED, false);
  }

  async connected() {
    if (!this._token) {
      return false;
    }

    try {
      await fetch(`${this._server}/api/v2/restaurant/connection`, {body: {token: this._token}});
    } catch (e) {
      return false;
    }

    return true;
  }

  async stream() {
    if (this._socket) {
      return;
    }

    const {body: {data: {address, uuid}}} = await fetch(`${this._server}/api/v2/restaurant/socket`, {
      method: 'post', body: {token: this._token}
    });

    const socket = io(format(address), {query: `id=${uuid}`, secure: true});

    // intercept
    socket.onevent = packet => {
      const args = packet.data || [];

      if (packet.id !== null) {
        args.push(socket.ack(packet.id));
      }

      const _args = args.slice();
      _args[0] = `REST/${args[0]}`;

      this._emit(..._args);
      this._emit(...args);
    };

    this.on('alive?', beat);
  }

  async orders() {
    try {
      const {body: {data: {orders}}} =
        await fetch(`${this._server}/api/v2/restaurant/orders`, {
          body: {token: this._token}
        });

      this._activeOrders = orders;

      return this._activeOrders;
    } catch (e) {
      // ignore
    }

    return [];
  }

  async enabled(enabled) {
    const {body: {data: {restaurant}}} =
      await fetch(`${this._server}/api/v2/restaurant/enabled`, {method: 'post', body: {token: this._token, enabled}});

    return restaurant;
  }

  async info() {
    const {body: {data: {restaurant}}} =
      await fetch(`${this._server}/api/v2/restaurant/info`, {body: {token: this._token}});

    return restaurant;
  }

  async order(id, status, {prepTime, message} = {}) {
    if (arguments.length <= 1) {
      const {body: {data: {order}}} =
        await fetch(`${this._server}/api/v2/restaurant/order/${id}`, {body: {token: this._token}});

      return order;
    }

    const {body: {data: {order}}} =
      await fetch(`${this._server}/api/v2/restaurant/order/${id}/status`, {
        method: 'post',
        body: {token: this._token, status, prepTime, message}
      });

    return order;
  }

  async history(after = null) {
    if (after === null) {
      after = _.max(this._inactiveOrders, a => new Date(a.createdAt));
    }

    const {body: {data: {orders}}} =
      await fetch(`${this._server}/api/v2/restaurant/orders/history`, {
        body: {token: this._token, after, limit: this._limit}
      });

    this._inactiveOrders = orders;

    return this._inactiveOrders;
  }

  async feedback(content) {
    await fetch(`${this._server}/api/v2/restaurant/feedback`, {method: 'post', body: {content}});
  }
}

export default RESTaurant;
