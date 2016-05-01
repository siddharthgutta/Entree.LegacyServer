import './test-init.es6';
import {GCM} from '../libs/socket-server/index.es6';
import ipc from '../libs/ipc.es6';

class TokenStore extends GCM.TokenStore {

  testToken = {
    id: 'mz2EUGpbDfE:APA91bGVlHYip05Bl6dmy95nOFeOIh0XVxNyYEh56WKYMO_xiXzE8rMB5izLmVLCEb1m_2' +
    'RsnhV9viRgib_sx8TUBdaB98rl4jVO4BsfP7eSFsqfCmwAup_eGRSYFIoz5szrrIFOeDBQ'
  };

  async set(token, {id}) {
    this[token] = {id};
  }

  async get(token) {
    return this[token];
  }

  async has(token) {
    return !!this[token];
  }

  async delete(token) {
    delete this[token];
  }
}

const token = 'testToken';
const gcm = new GCM(ipc, new TokenStore());

describe('GCM', () => {
  it('should connect', async () => {
    await gcm.connect();
  });

  it('should send a message', async () => {
    gcm.emit(token, 'test-channel', {sup: 10}, false);
  });

  it('should send a message with awk', async () => {
    await gcm.emit(token, 'test-channel', {
      sup: 10,
      alert: 'This is a notification that will be displayed ASAP.'
    }, 5000);
  });

  it('should disconnect', async () => {
    gcm.disconnect();
  });
});
