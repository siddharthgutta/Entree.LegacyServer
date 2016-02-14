import ipc from 'node-ipc';
import Master from '../master.es6';

class NodeIPC extends Master {
  constructor(remote, opts = {}) {
    opts = Object.assign({debug: true, appspace: ''}, opts);

    super(opts.debug);

    this.remote = remote;
    this.address = 'localhost';
    this.accepted = new Map();

    ipc.config.id = 'socket';
    ipc.config.retry = 5;
    ipc.config.maxRetries = 20;
    ipc.config.networkHost = '0.0.0.0';
    ipc.config.maxConnections = 10;
    ipc.config.appspace = opts.appspace;
    ipc.config.silent = !this.debug;
  }

  listen(port, cb = () => 0) {
    ipc.config.networkPort = port;

    ipc[this.remote ? 'serveNet' : 'serve'](() => {
      ipc.config.stopRetrying = true; // TODO test corner cases

      ipc.server.on('authorize', (req, socket) => {
        const origin = req.data.origin;

        if (this.accepted.has(origin)) {
          socket.__destroyed = true;
          socket.destroy();
        } else {
          this.accepted.set(origin, socket);
        }
      });

      ipc.server.on('*', (event, req) => {
        if (event === 'authorize') {
          return;
        }

        const origin = req.id;

        if (this.accepted.has(origin)) {
          this._emit(event, origin, req.data);
        }
      });

      ipc.server.on('socket.disconnected', socket => {
        if (socket.__destroyed) {
          return;
        }

        const origin = socket.id;

        this.accepted.delete(origin);
      });

      process.nextTick(cb);
    });

    ipc.server.start();
  }

  emit(origin, channel, data) {
    try {
      if (this.accepted.has(origin)) {
        const socket = this.accepted.get(origin);

        try {
          ipc.server.emit(socket, channel, {id: ipc.config.id, data});
        } catch (e) {
          console.error(e);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

export default NodeIPC;
