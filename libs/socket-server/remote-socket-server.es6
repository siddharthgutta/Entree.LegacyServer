import SocketServer from '../socket-server.es6';
import config from 'config';
import cid from '../cluster-id.es6';

const id = config.get('AppId');
const remoteSocketServer = config.get('RemoteSocketServer');
const debug = true;

class RemoteSocketServer extends SocketServer {
  constructor(_id = '') {
    super([id + _id + cid].join('-'), remoteSocketServer, true, null, {debug, appspace: remoteSocketServer.port});
  }

  address() {
    return super.address().then(address => {
      address.hostname = remoteSocketServer.hostname; // override with SSL name
      return address;
    });
  }
}

export default RemoteSocketServer;
