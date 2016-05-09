import EventEmitter from 'events';
import {Message, Result, Notification} from 'node-xcs';
import {Router} from 'express';
import path from 'path';

const noop = () => 0;

class TokenStore {
  async set(token, {id = null}) {
    throw Error('Not implemented', token, {id});
  }

  async get(token) {
    throw Error('Not implemented', token);
  }

  async has(token) {
    throw Error('Not implemented', token);
  }

  async delete(token) {
    throw Error('Not implemented', token);
  }
}

class GCMXMPP extends EventEmitter {
  static TokenStore = TokenStore;

  constructor(pubsub, tokenStore) {
    super();

    if (!(tokenStore instanceof TokenStore)) {
      throw Error('Must provide a token store implementation');
    }

    this._pubsub = pubsub;
    this._sender = null;
    this._tokenStore = tokenStore;

    this._pubsub.on('gcm-receipt', a => console.error(a));
  }

  _emit(...args) {
    super.emit(...args);
  }

  async connect() {
    this._sender = await this._pubsub.Master.emit('gcm-sender');
    return true;
  }

  async accept(token) {
    try {
      await this._tokenStore.set(token, {id: null});

      return {uuid: token, sender: this._sender};
    } catch (e) {
      throw new TraceError('Could not accept token', e);
    }
  }

  async reject(token) {
    try {
      await this._tokenStore.delete(token);

      return token;
    } catch (e) {
      throw new TraceError('Could not reject token', e);
    }
  }

  async address({hostname, port, protocol}, routerPathname) {
    return {hostname, port, protocol, pathname: path.join(routerPathname, 'connect')};
  }

  async _send(token, channel, data, awk = true, resolve, reject) {
    let notification = null;

    if (data.notification) {
      // build notification
      notification = new Notification('ic_launcher')
        .title(data.notification.title)
        .body(data.notification.body)
        .build();
    }

    if (awk) {
      awk = isNaN(awk) ? 2000 : awk;
    }

    const id = `entree-gcm-${Date.now() + Math.random() * 50}`;
    const setup = new Message(id);
    setup.priority('high');
    setup.collapseKey('com.entreeapp.producer');
    setup.addData('data', JSON.stringify(data));
    setup.addData('channel', channel);
    setup.addData('id', id);
    setup.addData('awk', !!awk);
    setup.addData('content-available', 1);
    setup.timeToLive(600);
    setup.delayWhileIdle(true);
    setup.deliveryReceiptRequested(!!awk);
    setup.contentAvailable(true);

    if (notification) {
      setup.notification(notification);
    }

    const message = setup.build();
    const subscription = await this._tokenStore.get(token);

    if (!subscription || !subscription.id) {
      reject(new TraceError('No valid subscription assigned to token', subscription));
      return;
    }

    if (awk) {
      let tid;
      let receiptCheck;
      let awkCheck;

      const removeListeners = () => {
        this.removeListener(`awk-${id}`, awkCheck);
        this.removeListener(`receipt`, receiptCheck);
      };

      receiptCheck = _id => {
        clearTimeout(tid);
        removeListeners();

        if (id === _id) {
          resolve(true);
        }
      };

      awkCheck = () => {
        clearTimeout(tid);
        removeListeners();

        resolve(true);
      };


      this.on(`awk-${id}`, awkCheck);
      this.on('receipt', receiptCheck);

      tid = setTimeout(() => {
        removeListeners();
        reject(Error('Timeout delayed'));
      }, awk);
    }

    // FIXME emit can still occur after, why taking so long?
    const res = await this._pubsub.Master.emit('gcm-sendNoRetry', {
      message,
      to: subscription.id
    }, !awk || isNaN(awk) ? 2000 : awk);

    const result = Object.assign(new Result(), res);
    const err = result.getError();

    if (err) {
      reject(new TraceError('Could not send GCM message', err));
    } else if (!awk) {
      resolve(true);
    }
  }

  emit(token, channel, data, awk = 2000, resolve, reject) {
    if (!awk) {
      return this._send(token, channel, data, awk, noop, noop);
    }

    if (typeof resolve === 'function' && typeof reject === 'function') {
      return this._send(token, channel, data, awk, resolve, reject);
    }

    return new Promise((_resolve, _reject) => {
      this._send(token, channel, data, awk, _resolve, _reject);
    });
  }

  volatile(token, channel, data) {
    return this.emit(token, channel, data, false);
  }

  router() {
    const router = new Router();

    router.post('/connect', async (req, res) => {
      const {id} = req.body;
      const {uuid} = req.query;

      const disconnect = {
        pathname: path.join(req.baseUrl, 'disconnect'),
        query: {...req.query, uuid}
      };

      const awk = {
        pathname: path.join(req.baseUrl, 'awk'),
        query: {...req.query, uuid}
      };

      if (id && uuid) {
        if (await this._tokenStore.has(uuid)) {
          await this._tokenStore.set(uuid, {id});

          this._emit('connected', uuid, {id});
        }

        return res.send({disconnect, awk, sender: this._sender}).status(200);
      }

      res.send().status(400);
    });

    router.post('/disconnect', (req, res) => {
      const {uuid} = req.query;

      if (uuid) {
        this._emit('disconnected', uuid);
        return res.send().status(200);
      }

      res.send().status(400);
    });

    router.post('/awk', (req, res) => {
      const {id} = req.body;

      if (id) {
        this._emit(`awk-${id}`, id);
      }

      res.send().status(200);
    });

    return router;
  }

  async disconnect() {
    return true;
  }
}

export default GCMXMPP;
