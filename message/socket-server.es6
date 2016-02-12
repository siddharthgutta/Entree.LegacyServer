/**
 * Created by kfu on 2/12/16.
 */

import SocketTable from './socket-table.es6';
import sio from './sio.es6';

export const st = new SocketTable(4);

export function initSocket() {
// Socket.io configuration
  sio.on('connection', socket => {
    const token = socket.handshake.query.id;
    if (st.tokenExists(token)) {
      console.log(`Server connected to client with token: ${token}`);

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
  st[token].forEach(socket => {
    socket.volatile.emit(channel, data);
  });
}
