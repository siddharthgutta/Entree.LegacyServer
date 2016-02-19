import '../test-init.es6';
import io from 'socket.io-client';
import assert from 'assert';
import {format} from 'url';
import now from 'performance-now';
import Promise from 'bluebird';
import crypto from 'crypto';
import ss from '../../message/socket-server.es6';

const message = global.TEST;
const token = crypto.randomBytes(15).toString('hex');
const msgCount = 10000;
const channel = 'send';

let socket;

before(done => {
  if (!ss.isRemote()) {
    console.log('Please use remote server').then(() => process.exit(0));
  } else {
    done();
  }
});

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
    const messages = new Array(msgCount);

    socket.on(channel, (data, respond) => {
      assert(data, message);
      respond({status: 'ok'});
    });

    for (let i = 0; i < messages.length; i++) {
      messages[i] = ss.emit(token, channel, message + i);
    }

    Promise.all(messages).then(() => {
      const duration = ((now() - start) / 1000);
      console.log(`throughput ${(msgCount / duration).toFixed(3)} messages/second`);
      done();
    });
  });

  it('should disconnect client (from server)', done => {
    ss.once(`client-disconnected-${token}`, () => done());

    ss.reject(token);
  });

  it('should disconnect socket-server', () => {
    ss.disconnect();
  });

  it('should force exit', () => {
    process.exit(0);
  });
});
