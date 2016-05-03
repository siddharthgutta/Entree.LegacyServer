import {LocalSocketServer, RemoteSocketServer} from './socket-server/index.es6';
import config from 'config';

let ipc;
if (config.get('UseRemoteSocketServer')) {
  ipc = new RemoteSocketServer();
} else {
  ipc = new LocalSocketServer();
}

ipc.connect();

export default ipc;
