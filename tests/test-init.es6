import path from 'path';
import stack from 'callsite';
import config from 'config';
import SocketServer from '../libs/socket-server.es6';

global.TEST = path.basename(stack()[7].getFileName());
setTimeout(() => process.exit(1), 120000);

export function getSocketServer() {
  const id = config.get('AppId');
  const address = config.get('Server');
  const remote = config.get('IPC.allowRemote');

  return new SocketServer(id, address, remote, null, {appspace: address.port});
}
