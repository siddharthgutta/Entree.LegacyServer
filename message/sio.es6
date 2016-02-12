import io from 'socket.io';
import SocketTable from './socket-table.es6';

const sio = io();
export default sio;

const st = new SocketTable();

// Socket.io configuration
sio.on('connection', socket => {
  const token = socket.handshake.query.id;
  if (st.tokenExists(token)) {
    console.log(`Server connected to client with token: ${token}`);
  } else {
    socket.disconnect();
  }
});
