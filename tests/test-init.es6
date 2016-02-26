import path from 'path';
import stack from 'callsite';
import config from 'config';
import * as PubSub from 'node-pubsub';

global.TEST = path.basename(stack()[7].getFileName());

const address = config.get('Server');
const id = config.get('AppId') + address.port + global.TEST;
const remote = config.get('IPC.allowRemote');

class PubSubTest extends PubSub.Slave {
  address() {
    return super.address().then(_address => {
      _address.hostname = '0.0.0.0';
      return _address;
    });
  }
}

let count = 0;
export function getPubSub() {
  return new PubSubTest(id + ++count, address, remote, {
    debug: true,
    appspace: address.port
  });
}
