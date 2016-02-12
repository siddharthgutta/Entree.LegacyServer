/**
 * Created by kfu on 2/12/16.
 */

import SocketTable from './socket-table.es6';
import sio from './sio.es6';

export const st = new SocketTable(4);

export function initSocket() {
  console.log('Initialized Socket Server');
  // Socket.io configuration
  sio.on('connection', socket => {
    const token = socket.handshake.query.id;
    if (st.tokenExists(token)) {
      console.log(`Server connected to client with token: ${token}`);
      st.addSocket(token, socket);
      socket.on('disconnect', () => {
        st.removeSocket(token, socket);
        // Insert IPC call here to tell main server to remove
      });
    } else {
      console.log(`Disconnected client because of incorrect token: ${token}`);
      socket.disconnect();
    }
  });
}

export function emit(channel, token, data) {
  if (token in st) {
    console.log(`Emitting to ${st[token].length} sockets for ${token} token`);
    st[token].forEach(socket => {
      if (socket) {
        socket.volatile.emit(channel, data);
      }
    });
  } else {
    console.log(`Could not emit to invalid token: ${token}`);
  }
}
