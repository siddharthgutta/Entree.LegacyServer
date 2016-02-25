import SocketServer from '../socket-server.es6';
import config from 'config';
import cid from '../cluster-id.es6';

const id = config.get('AppId');
const socketServer = config.get('SocketServer');
const debug = true;

class LocalSocketServer extends SocketServer {
  constructor(_id = '') {
    super([id + _id + cid].join('-'), socketServer, false, null, {debug, appspace: socketServer.port});
  }

  address() {
    return super.address().then(address => {
      address.hostname = socketServer.extHostname; // FIXME
      return address;
    });
  }

  resolveHost() {
    return '127.0.0.1'; // force localhost
  }
}

export default LocalSocketServer;
