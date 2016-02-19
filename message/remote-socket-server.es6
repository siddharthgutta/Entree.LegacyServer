import SocketServer from '../libs/socket-server.es6';
import config from 'config';

const id = config.get('AppId');
const remoteSocketServer = config.get('RemoteSocketServer');
const debug = false; // config.get('NodeEnv') === 'production'

/**
 *
 * @bluejamesbond
 *
 * Server is meant for throughput testing with large number of sockets; this ensures the
 * performance of active  server
 *
 */

class RemoteSocketServer extends SocketServer {
  constructor() {
    super(id, remoteSocketServer, 'socket', true, debug);
  }
}

export default RemoteSocketServer;
