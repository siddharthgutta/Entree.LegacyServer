import io from 'socket.io';
import Slave from '../slave.es6';

export class SocketIO extends Slave {
  constructor(debug = true) {
    super(debug);
    this.sio = io();
    this.connected = new Map();
  }

  attach(server) {
    this.sio.on('connection', socket => this._onConnect(socket));
    this.sio.attach(server);
  }

  accept(origin, token) {
    const uuid = super.accept(origin, token);

    this.log('added uuid', uuid);

    this._emit('token-added', origin, {token, uuid});
  }

  reject(origin, token) {
    const uuid = super.reject(origin, token);

    this.log('removed uuid', uuid);

    if (uuid) {
      const currSocket = this.connected.get(uuid);
      SocketIO.terminate(currSocket);

      this.connected.delete(token);
    }

    this._emit('token-removed', origin, {token});
  }

  // TODO awk?
  broadcast(channel, data) {
    this.sio.sockets.emit(channel, data);
  }

  // FIXME respond with client-error?
  emit(origin, token, channel, id, data, awk = true) {
    const uuid = this.uuidOf(origin, token);
    const socket = this.connected.get(uuid);

    if (socket) {
      this.log(`socket exists on ${token}`);

      // FIXME too much scoping?
      try {
        if (!awk) {
          socket.emit(channel, data);
        } else {
          socket.emit(channel, data, res => {
            this._emit('client-received', origin, {token, channel, id, _data: data, data: res}); // awk
          });
        }

        this.log(`socket data emitted ${token}/${channel}`, data);
      } catch (e) {
        console.error(e);
        // ignore
      }
    } else {
      this.log(`token does not exist: ${token}`);
    }
  }

  static terminate(socket) {
    if (!socket) {
      return;
    }

    try {
      socket.emit('termination', {data: 'forced disconnection'});
      socket.disconnect();
    } catch (e) {
      console.error(e);
    }
  }

  _onConnect(socket) {
    const uuid = socket.handshake.query.id;

    if (this.isAccepted(uuid)) {
      const {origin, token} = this.originOf(uuid);
      const currSocket = this.connected.get(uuid);

      SocketIO.terminate(currSocket);

      this.connected.set(uuid, socket);

      this.log(`server connected to client with token: ${token}`);

      socket.on('disconnect', () => {
        this.log(`socket disconnected with token: ${token}`);

        this.connected.delete(uuid);

        this._emit('client-disconnected', origin, {token});
      });
    } else {
      console.log('socket uuid not found', uuid);

      SocketIO.terminate(socket);
    }
  }
}

export default SocketIO;
