import SocketServer from '../libs/socket-server.es6';
import config from 'config';
import address from '../libs/address.es6';

const id = config.get('AppId');
const socketServer = config.get('SocketServer');
const debug = config.get('NodeEnv') !== 'production';

socketServer.appspace = socketServer.port;

const eventMap = {
  delimiter: '-',

  // request events
  requestBroadcast: null,
  requestEmit: 'send',
  requestServerAddress: null,
  requestAddToken: 'token',
  requestRemoveToken: null,

  // response events
  responseClientAwk: null,
  responseClientDisconnected: 'disconnect',
  responseClientConnected: null,
  responseServerAddress: null,
  responseTokenAdded: null,
  responseTokenRemoved: null
};

class LocalSocketServer extends SocketServer {
  constructor() {
    super(id, socketServer, 'socket', false, debug, eventMap);

    this._address = address(socketServer, 'https');
  }

  address() {
    return this._address;
  }

  resolveHost() {
    return '127.0.0.1'; // force localhost
  }

  wrap(req, event) {
    if (this.debug) {
      console.tag('local-socket-server').log(req, event);
    }

    // data input is actually named message so we reassign
    if (req && req.data && req.data.data) {
      req.data.message = req.data.data;
      delete req.data.data;
    }

    if (req && req.data) {
      req = {
        ...req,
        ...req.data
      };
    }

    return req;
  }

  unwrap(res, event) {
    // undo the wrap
    if (this.debug) {
      console.tag('local-socket-server').log(res, event);
    }

    return {
      data: res || {}
    };
  }

  emit(token, data) {
    super.emit(token, null, data, false);
  }

  volatile() {
    throw new Error('Not implemented by socket-server');
  }

  emitCB() {
    throw new Error('Not implemented by socket-server');
  }

  reject() {
    throw new Error('Not implemented by socket-server');
  }

  broadcast() {
    throw new Error('Not implemented by socket-server');
  }
}

export default LocalSocketServer;
