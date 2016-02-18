import config from 'config';
import LocalSocketServer from './local-socket-server.es6';

let socketServer;
let mode = 'local';

if (config.get('UseRemoteSocketServer')) {
  const RemoteSocketServer = require('./remote-socket-server.es6'); // private :) for throughput testing
  socketServer = new RemoteSocketServer();
  mode = 'remote';
} else {
  socketServer = new LocalSocketServer();
}

console.tag('sio').log(`Using ${mode} socket server`);

export default socketServer;
