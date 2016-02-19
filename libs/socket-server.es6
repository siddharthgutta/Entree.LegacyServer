import ipc from 'node-ipc';
import async from 'async';
import EventEmitter from 'events';
import Promise from 'bluebird';
import crypto from 'crypto';

/**
 * Implementation is slightly modified to meet our requirements.
 * Code will eventually be going into an NPM module; let me know of any changes
 * @bluejamesbond
 */

const defaultEventMap = {
  delimiter: '-',

  // request events
  requestBroadcast: 'broadcast',
  requestEmit: 'emit',
  requestServerAddress: 'get-server-address',
  requestAddToken: 'add-token',
  requestRemoveToken: 'remove-token',

  // response events
  responseClientAwk: 'client-received',
  responseClientDisconnected: 'client-disconnected',
  responseClientConnected: 'client-connected',
  responseServerAddress: 'server-address',
  responseTokenAdded: 'token-added',
  responseTokenRemoved: 'token-removed'
};

class SocketServer extends EventEmitter {
  constructor(id, address, channel = 'socket', remote, debug = false,
              eventMap = defaultEventMap,
              resDefaultTimeout = 60000, concurrency = 50) {
    super();

    this.id = id.replace(/[^a-zA-Z0-9]/g, '');
    this.channel = channel;
    this.eventMap = Object.assign(defaultEventMap, eventMap);
    this.remoteAddress = address;
    this.remote = remote;
    this.resDefaultTimeout = resDefaultTimeout;
    this.debug = debug;

    this.setMaxListeners(Number.MAX_SAFE_INTEGER);

    this.queue = async.queue((data, callback) => {
      const _callback = () => process.nextTick(callback);
      if (typeof data === 'function') {
        return data(_callback);
      }

      this._handleTransmit(data, _callback);
    }, concurrency);

    this.queue.pause();
  }

  // private emit
  _emit(...args) {
    super.emit(...args);
  }

  resolveHost(address) {
    let host = address.hostname || '0.0.0.0';

    if (host === 'localhost' || host === '::1' || host === '127.0.0.1') {
      host = '0.0.0.0';
    }

    return host;
  }

  resolvePort(address) {
    return address.port;
  }

  configure() {
    // ignore
  }

  connect() {
    const eventMap = this.eventMap;
    const address = this.remoteAddress;

    ipc.config.id = this.id;
    ipc.config.retry = 5;
    ipc.config.maxRetries = 20;
    ipc.config.silent = !this.debug;
    ipc.config.networkHost = this.resolveHost(address);
    ipc.config.networkPort = this.resolvePort(address);

    if (address.appspace) {
      ipc.config.appspace = address.appspace;
    }

    this.configure(ipc);

    return new Promise(resolve => {
      ipc[this.remote ? 'connectToNet' : 'connectTo'](this.channel, () => {
        ipc.of[this.channel].on('connect', () => {
          ipc.config.stopRetrying = true;
          resolve();

          this.queue.resume();
        });
      });

      ipc.of[this.channel].on('disconnect', () => {
        this.queue.pause();
      });

      ipc.of[this.channel].on(eventMap.responseTokenAdded, data => {
        data = this.unwrap(data, eventMap.responseTokenAdded).data;

        this._emit(eventMap.responseTokenAdded, data);
        this._emit(this.for(eventMap.responseTokenAdded, data.token), data);
      });

      ipc.of[this.channel].on(eventMap.responseServerAddress, data => {
        data = this.unwrap(data, eventMap.responseServerAddress).data;

        this._emit(eventMap.responseServerAddress, data);
      });

      ipc.of[this.channel].on(eventMap.responseTokenRemoved, data => {
        data = this.unwrap(data, eventMap.responseTokenRemoved).data;

        this._emit(eventMap.responseTokenRemoved, data);
        this._emit(this.for(eventMap.responseTokenRemoved, data.token), data);
      });

      ipc.of[this.channel].on(eventMap.responseClientAwk, data => {
        data = this.unwrap(data, eventMap.responseClientAwk).data;

        this._emit(eventMap.responseClientAwk, data);
        this._emit(this.for(eventMap.responseClientAwk, data.id), data);
      });

      ipc.of[this.channel].on(eventMap.responseClientConnected, data => {
        data = this.unwrap(data, eventMap.responseClientConnected).data;

        this._emit(eventMap.responseClientConnected, data);
        this._emit(this.for(eventMap.responseClientConnected, data.token), data);
      });

      ipc.of[this.channel].on(eventMap.responseClientDisconnected, data => {
        data = this.unwrap(data, eventMap.responseClientDisconnected).data;

        this._emit(eventMap.responseClientDisconnected, data);
        this._emit(this.for(eventMap.responseClientDisconnected, data.token), data);
      });
    });
  }

  generateUUID() {
    return crypto.randomBytes(10).toString('hex');
  }

  unwrap(data) {
    return data || {data: {}};
  }

  wrap(data) {
    return data;
  }

  _handleTransmit({token, channel, data, resolve, action, reject, awk}, callback) {
    const eventMap = this.eventMap;
    const eventId = this.generateUUID();

    if (action === this.eventMap.requestBroadcast) {
      this._emitIPC(action, this.wrap({
        id: ipc.config.id,
        data: {
          id: eventId,
          token,
          channel,
          data,
          awk
        }
      }));

      return callback();
    }

    let tid;
    let event;

    const accepted = res => {
      clearTimeout(tid);
      resolve(res.data);
    };

    const timeout = () => {
      this.removeListener(event, accepted);
      reject({token, channel, data, awk});
    };

    if (awk) {
      event = this.for(eventMap.responseClientAwk, eventId);

      const wait = typeof awk === 'number' && awk > 0 ? awk : this.resDefaultTimeout;

      this.once(event, accepted);
      tid = setTimeout(timeout, wait);
    }

    this._emitIPC(action, this.wrap({
      id: ipc.config.id,
      data: {
        id: eventId,
        token,
        channel,
        data,
        awk
      }
    }, action));

    callback();
  }

  for(event, id) {
    return [event, id].join(this.eventMap.delimiter);
  }

  _emitIPC(event, data) {
    ipc.of[this.channel].emit(event, data);
  }

  accept(token) {
    const eventMap = this.eventMap;

    return new Promise(resolve => {
      if (eventMap.responseTokenAdded) {
        this.once(this.for(eventMap.responseTokenAdded, token), () => resolve(token));
      }

      this._emitIPC(eventMap.requestAddToken, this.wrap({
        id: ipc.config.id,
        data: {token}
      }, eventMap.requestAddToken));

      if (!eventMap.responseTokenAdded) {
        resolve(token);
      }
    });
  }

  reject(token) {
    const eventMap = this.eventMap;

    return new Promise(resolve => {
      if (eventMap.responseTokenRemoved) {
        this.once(this.for(eventMap.responseTokenRemoved, token), () => resolve(token));
      }

      this._emitIPC(eventMap.requestRemoveToken, this.wrap({
        id: ipc.config.id,
        data: {token}
      }, eventMap.requestRemoveToken));

      if (!eventMap.responseTokenRemoved) {
        resolve(token);
      }
    });
  }

  volatile(token, channel, data) {
    return this.emit(token, channel, data, false);
  }

  emit(token, channel, data, awk = true) {
    if (!awk) {
      return this.queue.push({token, action: this.eventMap.requestEmit, channel, data});
    }

    return new Promise((resolve, reject) => {
      this.queue.push({token, action: this.eventMap.requestEmit, channel, data, awk, resolve, reject});
    });
  }

  emitCB(token, channel, data, resolve, reject) {
    this.queue.push({token, channel, action: this.eventMap.requestEmit, data, awk: true, resolve, reject});
  }

  address() {
    if (!this._address) {
      this._address = new Promise(resolve => {
        this.queue.push(callback => {
          this.once(this.eventMap.responseServerAddress, _address => resolve(_address));
          this._emitIPC(this.eventMap.requestServerAddress, this.wrap({
            id: ipc.config.id,
            data: {}
          }, this.eventMap.requestServerAddress));
          callback();
        });
      });
    }

    return this._address;
  }

  broadcast(channel, data) {
    this.queue.push({channel, action: this.eventMap.requestBroadcast, data, awk: true});
  }

  disconnect() {
    ipc.disconnect(this.channel);
  }

  isRemote() {
    return this.remote;
  }

  isLocal() {
    return !this.remote;
  }
}

export default SocketServer;
