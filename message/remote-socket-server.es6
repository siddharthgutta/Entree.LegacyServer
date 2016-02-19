import SocketServer from '../libs/socket-server.es6';
import config from 'config';
import cid from '../libs/cluster-id.es6';

const id = config.get('AppId');
const remoteSocketServer = config.get('RemoteSocketServer');
<<<<<<< 1016d44cfe6d63499d84c18fb80b17927b19bcde
const debug = true; // config.get('NodeEnv') === 'production'
=======
const debug = false; // config.get('NodeEnv') === 'production'
>>>>>>> Adding some throughput tests

/**
 *
 * @bluejamesbond
 *
 * Server is meant for throughput testing with large number of sockets; this ensures the
 * performance of active  server
 *
 */

class RemoteSocketServer extends SocketServer {
  constructor(_id = id, channel = 'socket') {
    super(_id + cid, remoteSocketServer, channel, true, debug);
  }

  address() {
    return super.address().then(address => {
      address.hostname = remoteSocketServer.hostname; // override with SSL name
      return address;
    });
  }
}

export default RemoteSocketServer;
