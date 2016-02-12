import io from 'socket.io';
const EventEmitter = require('events');
import Strategy from './strategy.es6';

export const sioEmitter = new EventEmitter();

export default class SocketIO extends Strategy {
  constructor() {
    super();
    this.sio = io();
    this.init();
  }

  addToken(token) {
    this.st.addToken(token);
  }

  init() {
    console.log('Initialized Socket Server');
    // Socket.io configuration
    this.sio.on('connection', socket => {
      const token = socket.handshake.query.id;
      if (this.st.tokenExists(token)) {
        console.log(`Server connected to client with token: ${token}`);
        this.st.addSocket(token, socket);
        socket.on('disconnect', () => {
          this.st.removeSocket(token, socket);
          // Insert IPC call here to tell main server to remove
          sioEmitter.emit('disconnect', token);
        });
      } else {
        console.log(`Disconnected client because of incorrect token: ${token}`);
        socket.disconnect();
      }
    });
  }

  emit(channel, token, data) {
    if (token in this.st) {
      console.log(`Emitting to ${this.st[token].length} sockets for ${token} token`);
      this.st[token].forEach(socket => {
        if (socket) {
          socket.volatile.emit(channel, data);
        }
      });
    } else {
      console.log(`Could not emit to invalid token: ${token}`);
    }
  }
}

export const socketServer = new SocketIO();
