import config from 'config';
import LocalSocketServer from './local-socket-server.es6';
import RemoteSocketServer from './remote-socket-server.es6';

let socketServer;
let mode = 'local';

if (config.get('UseRemoteSocketServer')) {
  socketServer = new RemoteSocketServer();
  mode = 'remote';
} else {
  socketServer = new LocalSocketServer();
}

console.tag('sio').log(`Using ${mode} socket server`);
export default socketServer;
