/**
 * Created by kfu on 2/12/16.
 */

import ipc from 'node-ipc';
import {st, emit} from '../message/socket-server.es6';

// Unique identifier for the world
ipc.config.id = 'socket';
// Time in ms client will wait before trying to reconnect to server if disconnected
ipc.config.retry = 1000;
// Initially set maximum client to 1
ipc.config.maxConnections = 1;
// IPC Logging
ipc.config.silent = false;

ipc.serve(() => {
  ipc.server.on('token', data => {
    ipc.log('got a message from'.debug, (data.id).variable, (data.token).data);
    st.addToken(data.token);
  });

  ipc.server.on('received', data => {
    emit('received', (data.token).data, (data.message).data);
  });

  ipc.server.on('sent', data => {
    emit('sent', (data.token).data, (data.message).data);
  });
});

export function initIPC() {
  console.log('Initialized IPC Server');
  ipc.server.start();
}
