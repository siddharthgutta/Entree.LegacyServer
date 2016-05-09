import EventEmitter from 'events';
import {Message, Sender} from 'node-gcm';
import {format} from 'url';
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

class GCM extends EventEmitter {
  static TokenStore = TokenStore;

  constructor(sender, key, tokenStore) {
    super();

    if (!(tokenStore instanceof TokenStore)) {
      throw Error('Must provide a token store implementation');
    }

    this._sender = sender;
    this._key = key;
    this._tokenStore = tokenStore;
  }

  _emit(...args) {
    super.emit(...args);
  }

  async connect() {
    this._gcm = new Sender(this._key);
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
    let subscription;
    const hasToken = await this._tokenStore.has(token);

    if (hasToken) {
      try {
        subscription = await this._tokenStore.get(token);
      } catch (e) {
        // ignore
      }
    }

    if (!subscription || !subscription.id) {
      reject(new TraceError('No valid subscription assigned to token', subscription));
      return;
    }

    if (awk) {
      awk = isNaN(awk) ? 2000 : awk;
    }

    const id = `entree-gcm-${Date.now() + Math.random() * 50}`;
    const message = new Message({
      collapseKey: 'do-not-collapse',
      priority: 'high',
      contentAvailable: true,
      delayWhileIdle: true,
      timeToLive: 3,
      data: {
        id,
        ...(data ? data.notification : {}),
        data: JSON.stringify(data),
        channel,
        'content-available': '1',
        awk
      },
      notification: {...(data ? data.notification : {}), id}
    });

    if (awk) {
      let tid;

      const receiptCheck = _id => {
        clearTimeout(tid);

        if (id === _id) {
          resolve(true);
        }
      };

      this.on('receipt', receiptCheck);

      tid = setTimeout(() => reject(Error('Timeout delayed')), awk);
    }

    // FIXME emit can still occur after, why taking so long?
    this._gcm.send(message, {registrationTokens: [subscription.id]}, (err, res) => {
      if (err) return reject(err);
      console.log(res);
    });
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

      const disconnectUrlObj = {
        protocol: req.protocol,
        host: req.get('host'),
        pathname: path.join(req.baseUrl, 'disconnect'),
        query: {...req.query, uuid}
      };

      const aliveUrlObj = {
        protocol: req.protocol,
        host: req.get('host'),
        pathname: path.join(req.baseUrl, 'alive'),
        query: {...req.query, uuid}
      };

      const disconnect = format(disconnectUrlObj);
      const alive = format(aliveUrlObj);

      if (id && uuid) {
        if (await this._tokenStore.has(uuid)) {
          await this._tokenStore.set(uuid, {id});

          this._emit('connected', uuid, {id});
        }

        return res.send({disconnect, alive, sender: this._sender}).status(200);
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

    router.post('/alive', (req, res) => {
      const {uuid} = req.query;

      if (uuid) {
        this._emit(`alive-${uuid}`, uuid);
      }

      res.send().status(200);
    });

    return router;
  }

  async disconnect() {
    return true;
  }
}

export default GCM;
