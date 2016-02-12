import config from 'config';
import SocketServer from './socket-server.es6';
import {format} from 'url';

const extSocket = config.get('ExternalSocketServer');
const socketStrategy = new SocketServer(extSocket);

console.tag('sio').log(`Using external socket server running on ${format(extSocket)}`);

export default socketStrategy;
