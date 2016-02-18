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
              resTimeout = 60000, concurrency = 50) {
    super();

    this.id = id;
    this.channel = channel;
    this.eventMap = Object.assign(defaultEventMap, eventMap);
    this.remoteAddress = address;
    this.remote = remote;
    this.resTimeout = resTimeout;
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
        ipc.of.socket.on('connect', () => {
          ipc.config.stopRetrying = true;
          resolve();

          this.queue.resume();
        });
      });

      ipc.of.socket.on('disconnect', () => {
        this.queue.pause();
      });

      ipc.of.socket.on(eventMap.responseTokenAdded, data => {
        data = this.unwrap(data, eventMap.responseTokenAdded).data;

        this._emit(eventMap.responseTokenAdded, data);
        this._emit(this.for(eventMap.responseTokenAdded, data.token), data);
      });

      ipc.of.socket.on(eventMap.responseServerAddress, data => {
        data = this.unwrap(data, eventMap.responseServerAddress).data;

        this._emit(eventMap.responseServerAddress, data);
      });

      ipc.of.socket.on(eventMap.responseTokenRemoved, data => {
        data = this.unwrap(data, eventMap.responseTokenRemoved).data;

        this._emit(eventMap.responseTokenRemoved, data);
        this._emit(this.for(eventMap.responseTokenRemoved, data.token), data);
      });

      ipc.of.socket.on(eventMap.responseClientAwk, data => {
        data = this.unwrap(data, eventMap.responseClientAwk).data;

        this._emit(eventMap.responseClientAwk, data);
        this._emit(this.for(eventMap.responseClientAwk, data.id), data);
      });

      ipc.of.socket.on(eventMap.responseClientConnected, data => {
        data = this.unwrap(data, eventMap.responseClientConnected).data;

        this._emit(eventMap.responseClientConnected, data);
        this._emit(this.for(eventMap.responseClientConnected, data.token), data);
      });

      ipc.of.socket.on(eventMap.responseClientDisconnected, data => {
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

    function accepted(res) {
      clearTimeout(tid);
      resolve(res.data);
    }

    function timeout() {
      this.removeListener(event, accepted);
      reject(new Error('No awk received'));
    }

    if (awk) {
      const event = this.for(eventMap.responseClientAwk, eventId);

      this.once(event, accepted);
      tid = setTimeout(timeout, this.resTimeout);
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
    ipc.of.socket.emit(event, data);
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
