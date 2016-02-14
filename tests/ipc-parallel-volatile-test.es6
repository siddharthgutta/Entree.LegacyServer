import {getSocketServer} from './test-init.es6';
import io from 'socket.io-client';
import assert from 'assert';
import {format} from 'url';
import now from 'performance-now';
import crypto from 'crypto';

const socketServer = getSocketServer();
const message = global.TEST;
let accessor;
const msgCount = 10;
const channel = 'channel-0';

let socket;

describe(global.TEST, () => {
  it('should create socket-server', async () => {
    await socketServer.connect();
  });

  it('should add accessor', async () => {
    accessor = await socketServer.accept(crypto.randomBytes(15).toString('hex'));
  });

  it('should connect client', async done => {
    const address = await socketServer.address();
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
      socketServer.volatile(accessor.token, channel, message);
    }
  });

  it('should disconnect client (from server)', done => {
    socketServer.once(`client-disconnected-${accessor.token}`, () => done());

    socketServer.reject(accessor.token);
  });

  it('should disconnect socket-server', () => {
    socketServer.disconnect();
  });

  it('should force exit', () => {
    process.exit(0);
  });
});
