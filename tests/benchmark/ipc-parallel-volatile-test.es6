import '../test-init.es6';
import io from 'socket.io-client';
import assert from 'assert';
import {format} from 'url';
import now from 'performance-now';
import crypto from 'crypto';
import ss from '../../message/socket-server.es6';

const message = global.TEST;
const token = crypto.randomBytes(15).toString('hex');
const msgCount = 10000;
const channel = 'send';

let socket;

describe(global.TEST, () => {
  it('should create socket-server', done => {
    ss.connect().then(() => done());
  });

  it('should add token', done => {
    ss.accept(token).then(() => done());
  });

  it('should connect client', done => {
    ss.address().then(address => {
      const url = format(address);

      socket = io(url, {query: `id=${token}`, secure: true});
      socket.once('connect', () => done());
    });
  });

  it(`should send ${msgCount} messages to client`, done => {
    const start = now();
    let received = 0;

    socket.on(channel, data => {
      assert(data, message);

      if (++received === msgCount) {
        const duration = ((now() - start) / 1000);
        console.log(`throughput ${(msgCount / duration).toFixed(3)} messages/second`);
        done();
      }
    });

    for (let i = 0; i < msgCount; i++) {
      ss.volatile(token, channel, message);
    }
  });

  it('should disconnect client (from server)', done => {
    if (ss.isRemote()) {
      const event = ss.for(ss.eventMap.responseClientDisconnected, token);
      ss.once(event, () => done());
    }

    socket.disconnect();

    if (!ss.isRemote()) {
      done();
    }
  });

  it('should disconnect socket-server', () => {
    ss.disconnect();
  });

  it('should force exit', () => {
    process.exit(0);
  });
});
