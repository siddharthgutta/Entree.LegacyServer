import config from 'config';
import io from 'socket.io';
import SocketServer from './socket-server.es6';
import {format} from 'url';

let socketStrategy;

if (config.get('UseInternalSocket')) {
  socketStrategy = io();

  console.tag('sio').log(`Using internal socket server running on ${config.get('Server.port')}`);
} else {
  const extSocket = config.get('ExternalSocketServer');
  socketStrategy = new SocketServer(extSocket);

  console.tag('sio').log(`Using external socket server running on ${format(extSocket)}`);
}

export default socketStrategy;
