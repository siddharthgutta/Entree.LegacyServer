import EventEmitter from 'events';
import io from 'socket.io-client';
import {format} from 'url';
import fetch from './fetch.es6';
import _ from 'underscore';
import {SocketEvents} from '../../api/constants/client.es6';
import * as env from './env.es6';

const beat = (data, respond) => respond({status: 'ok'});

class RESTaurant extends EventEmitter {

  static Events = {
    CONNECTING: 'REST/CONNECTING',
    CONNECTED: 'REST/CONNECTED',
    DISCONNECTED: 'REST/DISCONNECTED',
    NEW_ORDER: `${SocketEvents.NEW_ORDER}`,
    ORDER_UPDATE: `${SocketEvents.ORDER_UPDATE}`,
    RESTAURANT_STATUS: `${SocketEvents.RESTAURANT_STATUS}`,
    RESTAURANT_UPDATED: `${SocketEvents.RESTAURANT_UPDATED}`
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

      const connected = await this.connected();

      if (connected) {
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

    if (env.isNative() && this._push) {
      await fetch(`${this._server}${this._gcmEndpoints.disconnect.pathname}`,
        {method: 'post', query: this._gcmEndpoints.disconnect.query});

      this._push.unregister();
      this._push = null;
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
      this._token = null;
      return false;
    }

    return true;
  }

  async stream() {
    if (this._socket) {
      try {
        this._socket.disconnect();
      } catch (e) {
        // ignore
      }

      this._socket = null;
    }

    const {body: {data: {address, extras}}} =
      await fetch(`${this._server}/api/v2/restaurant/socket`, {
        method: 'post', body: {token: this._token}
      });

    if (env.isNative()) {
      const gcm = env.getGCM();
      const ecb = `handleNotification${Date.now()}`;

      window[ecb] = event => {
        console.log(event);
      };

      this._gcmEndpoints = {};

      const conf = {
        android: {senderID: extras.gcm.sender},
        ios: {senderID: extras.gcm.sender, alert: 'true', badge: 'true', sound: 'true', gcmSandbox: false}
      };

      const push = gcm.init(conf);

      push.on('registration', async subscription => {
        const {body: endpoints} = await fetch(this._server + address.gcm.pathname, {
          method: 'post',
          query: {uuid: extras.gcm.uuid},
          body: {id: subscription.registrationId}
        });

        console.log(endpoints, subscription);

        this._gcmEndpoints = endpoints;

        push.on('notification', async message => {
          console.log(message);

          if (message.additionalData.data) {
            try {
              message.additionalData.data = JSON.parse(message.additionalData.data);
            } catch (e) {
              // ignore
            }
          } else {
            message.additionalData.data = {};
          }

          const {awk, data, channel, id} = message.additionalData;

          this._emit(channel, data);

          try {
            if (awk !== 'false') {
              await fetch(`${this._server}${this._gcmEndpoints.awk.pathname}`, {method: 'post', body: {id}});
            }
          } catch (e) {
            // ignore
          } finally {
            push.finish();
          }
        });
      });

      push.on('error', e => {
        console.error(e);
      });

      this._push = push;
    } else {
      this._socket = io(format(address.sio), {query: `id=${extras.sio.uuid}`, secure: true});

      const onevent = this._socket.onevent;
      this._socket.onevent = function (packet) {
        const args = packet.data || [];
        onevent.call(this, packet);
        packet.data = ['*'].concat(args);
        onevent.call(this, packet);
      };

      this._socket.on('*', (...args) => this._emit(...args));
      this._socket.on('alive?', beat);
    }
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

    this._emit(RESTaurant.Events.ORDER_UPDATE, order);

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
