import {Slave} from 'node-pubsub';
import config from 'config';
import * as Runtime from '../runtime.es6';

const remoteSocketServer = config.get('RemoteSocketServer');
const debug = true;

class RemoteSocketServer extends Slave {
  constructor(id = '') {
    super(id + Runtime.uid, remoteSocketServer, {
      remote: true,
      debug,
      master: remoteSocketServer.port
    });
  }

  address() {
    return super.address().then(address => {
      address.hostname = remoteSocketServer.hostname; // override with SSL name
      return address;
    });
  }
}

export default RemoteSocketServer;
