import {Slave} from 'cluster-pubsub';
import config from 'config';
import * as Runtime from '../runtime.es6';
import Promise from 'bluebird';

const socketServer = config.get('SocketServer');
const debug = !Runtime.isTest();

class LocalSocketServer extends Slave {
  constructor(id = '') {
    super(id + Runtime.uid, socketServer, {debug, master: socketServer.port});
  }

  address() {
    return Promise.all([super.address(), Runtime.hostname()])
                  .spread((address, hostname) => {
                    address.hostname = hostname;
                    return address;
                  });
  }

  resolveHost() {
    return '127.0.0.1'; // force localhost
  }
}

export default LocalSocketServer;
