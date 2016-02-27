import {getPubSub} from './test-init.es6';
import io from 'socket.io-client';
import assert from 'assert';
import {format} from 'url';
import now from 'performance-now';
import crypto from 'crypto';

const ps = getPubSub();
const message = global.TEST;
let accessor;
const msgCount = 10;
const channel = 'channel-0';

let socket;

describe(global.TEST, () => {
  it('should create socket-server', async () => {
    await ps.connect();
  });

  it('should add accessor', async () => {
    accessor = await ps.accept(crypto.randomBytes(15).toString('hex'));
  });

  it('should connect client', async done => {
    const address = await ps.address();
    const url = format(address);

    socket = io(url, {query: `id=${accessor.uuid}`, secure: true});
    socket.once('connect', () => done());
  });

  it(`should send ${msgCount} messages to client`, done => {
    const start = now();
    let received = 0;

    socket.on(channel, (data, respond) => {
      assert(data, message);
      respond({status: 'ok'});

      if (++received === msgCount) {
        const duration = ((now() - start) / 1000);
        console.log(`throughput ${(msgCount / duration).toFixed(3)} messages/second`);
        done();
      }
    });

    for (let i = 0; i < msgCount; i++) {
      ps.volatile(accessor.token, channel, message);
    }
  });

  it('should disconnect client (from server)', done => {
    ps.Client.once(`disconnect-${accessor.token}`, () => done());

    ps.reject(accessor.token);
  });

  it('should disconnect socket-server', () => {
    ps.disconnect();
  });
});
