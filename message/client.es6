/**
 * Created by kfu on 2/11/16.
 */

import io from 'socket.io-client';

const socket = io(`http://localhost:3000`, {query: 'id=123456'});
socket.on('connection', data => {
  console.log(`client connected: ${data}`);
});

socket.on('disconnect', () => {
  console.log(`client disconnected`);
});
