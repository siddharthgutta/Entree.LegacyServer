/**
 * Created by kfu on 2/12/16.
 */

const EventEmitter = require('events');
import ipc from 'node-ipc';

// NEED TO IMPLEMENT BRANCHOFF & CONFIG ENVIRONMENT VARIABLES
const port = 3000;
// import config from 'config';
// const port = config.get('Server.port');
import Strategy from './strategy.es6';

export const ipcEmitter = new EventEmitter();

export class IPC extends Strategy {
  constructor(mainPort) {
    super(mainPort);
    this.address = 'localhost';
    this.init();
  }

  init() {
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
        ipcEmitter.emit('token', data.token);
      });

      ipc.server.on('received', data => {
        ipcEmitter.emit('received', (data.token).data, (data.message).data);
      });

      ipc.server.on('sent', data => {
        ipcEmitter.emit('sent', (data.token).data, (data.message).data);
      });
    });

    console.log('Initialized IPC Server');
    ipc.server.start();
  }

  disconnect(token) {
    ipc.server.emit({address: this.address, port: this.port}, 'disconnect', {token});
  }
}

export const ipcServer = new IPC(port);
