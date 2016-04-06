import EventEmitter from 'events';
import io from 'socket.io-client';
import {format} from 'url';
import fetch from './fetch';

const beat = (data, respond) => respond({status: 'ok'});

class RESTaurant extends EventEmitter {

  static Events = {
    CONNECTING: 'REST/CONNECTING',
    CONNECTED: 'REST/CONNECTED',
    DISCONNECTED: 'REST/DISCONNECTED'
  };

  token = null;
  socket = null;
  emitter = null;
  server = null;

  constructor(server, token) {
    super();

    this.server = server;
    this.token = token;
  }

  _emit(...args) {
    super.emit(...args);
  }

  async connect({token, credentials: {id, password} = {}}) {
    this._emit(RESTaurant.Events.CONNECTING, false);

    if (token) {
      this.token = token;

      if (await this.connected()) {
        this._emit(RESTaurant.Events.CONNECTED, token);

        return token;
      }
    }

    if (id && password && !(await this.connected())) {
      try {
        const {body: {data: {token: _token}}} = await fetch(`${this.server}/api/v2/restaurant/login`, {
          method: 'post',
          body: {
            id,
            password
          }
        });

        this.token = _token;

        this._emit(RESTaurant.Events.CONNECTED, _token);

        return _token;
      } catch (e) {
        // ignore
      }
    }

    this._emit(RESTaurant.Events.DISCONNECTED, false);
  }

  async disconnect() {
    this.token = null;

    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }

    this._emit(RESTaurant.Events.DISCONNECTED, false);
  }

  async connected() {
    if (!this.token) {
      return false;
    }

    try {
      await fetch(`${this.server}/api/v2/restaurant/connection`, {
        body: {
          token: this.token
        }
      });
    } catch (e) {
      return false;
    }

    return true;
  }

  async stream() {
    if (this.socket && this.socket.connected) {
      return;
    }

    const {body: {data: {address, uuid}}} = await fetch(`${this.server}/api/v2/restaurant/socket`, {
      method: 'post',
      body: {token: this.token}
    });

    const socket = io(format(address), {query: `id=${uuid}`, secure: true});

    // intercept
    socket.onevent = packet => {
      const args = packet.data || [];

      if (packet.id !== null) {
        args.push(socket.ack(packet.id));
      }

      this._emit(...args);
    };

    this.on('alive?', beat);
  }

  async orders() {
    try {
      const {body: {data: {orders}}} =
        await fetch(`${this.server}/api/v2/restaurant/orders`, {
          body: {token: this.token}
        });

      return orders;
    } catch (e) {
      // ignore
    }

    return [];
  }

  async enabled(enabled) {
    const {body: {data: {restaurant}}} =
      await fetch(`${this.server}/api/v2/restaurant/enabled`, {
        method: 'post',
        body: {
          token: this.token,
          enabled
        }
      });

    return restaurant;
  }

  async info() {
    const {body: {data: {restaurant}}} =
      await fetch(`${this.server}/api/v2/restaurant/info`, {
        body: {
          token: this.token
        }
      });

    return restaurant;
  }

  async order(id, status, {prepTime, message} = {}) {
    if (arguments.length <= 1) {
      const {body: {data: {order}}} =
        await fetch(`${this.server}/api/v2/restaurant/order/${id}`, {
          body: {
            token: this.token
          }
        });

      return order;
    }

    const {body: {data: {order}}} =
      await fetch(`${this.server}/api/v2/restaurant/order/${id}/status`, {
        method: 'post',
        body: {
          token: this.token,
          status,
          prepTime,
          message
        }
      });

    return order;
  }

  async feedback(content) {
    await fetch(`${this.server}/api/v2/restaurant/feedback`, {
      method: 'post',
      body: {
        content
      }
    });
  }
}

export default RESTaurant;
