/**
 * Created by kfu on 2/12/16.
 */

// TEST FILE that can be run after npm start
// WILL BE MOVED TO A REAL TEST SOON
// RUN using: node ipc/client.compiled.js

import ipc from 'node-ipc';
import io from 'socket.io-client';

ipc.config.id = 'main';
ipc.config.retry = 1000;

ipc.connectTo('socket', () => {
  ipc.of.socket.on('connect', () => {
    ipc.of.socket.emit('token',
      {
        id: ipc.config.id,
        token: '123456'
      });
    ipc.of.socket.on('disconnect', () => {
      ipc.log('disconnected from socket server');
    });

    setTimeout(() => {
      const socket = io(`http://localhost:3000`, {query: 'id=123456'});
      socket.on('connection', data => {
        console.log(`client connected: ${data}`);
      });

      socket.on('disconnect', () => {
        console.log(`client disconnected`);
      });

      socket.on('received', data => {
        console.log(`received: ${data}`);
      });

      socket.on('sent', data => {
        console.log(`sent: ${data}`);
      });

      setTimeout(() => {
        ipc.of.socket.emit('received',
          {
            id: ipc.config.id,
            token: '123456',
            message: 'receive message'
          });
        ipc.of.socket.emit('sent',
          {
            id: ipc.config.id,
            token: '123456',
            message: 'sent message'
          });
        setTimeout(() => {
          ipc.config.stopRetrying = 0;
          ipc.disconnect('socket');
          socket.disconnect();
        }, 1000);
      }, 1000);
    }, 1000);
  });
});
