import {getPubSub} from './test-init.es6';
import io from 'socket.io-client';
import assert from 'assert';
import {format} from 'url';
import now from 'performance-now';
import Promise from 'bluebird';
import crypto from 'crypto';

const psa = getPubSub();
const psb = getPubSub();

let accessor;

const message = global.TEST;
const msgCount = 10;
const channel = 'channel-0';

let socket;

describe(global.TEST, () => {
  it('should create socket-server', async () => {
    await psa.connect();
    await psb.connect();
  });

  it('should add accessor', async () => {
    accessor = await psa.accept(crypto.randomBytes(15).toString('hex'));
  });

  it('should send broadcast two peers', async done => {
    psb.Peer.once('yolo', (origin, data) => {
      assert(psa.origin, origin);
      assert(data.test, 'foo');
      done();
    });

    psa.Peer.once('yolo', () => {
      throw new Error('should not broadcast to same socket');
    });

    psa.Peer.broadcast('yolo', {test: 'foo'});
  });

  it('should emit between two peers', async () => {
    psb.Peer.once('yolo2', (origin, data, respond) => {
      assert(psa.origin, origin);
      assert(data.test, 'bar');
      respond({status: 'ok'});
    });

    psa.Peer.once('yolo2', () => {
      throw new Error('should not emit to same socket');
    });

    const dest = psb.origin;
    const res = await psa.Peer.emit(dest, 'yolo2', {test: 'bar'});

    if (res.status !== 'ok') {
      throw new Error('Failed response');
    }
  });


  it('should connect client', async done => {
    const address = await psa.address();
    const url = format(address);

    socket = io(url, {query: `id=${accessor.uuid}`, secure: true});
    socket.once('connect', () => done());
  });

  it(`should send ${msgCount} messages to client`, async () => {
    const start = now();

    socket.on(channel, (data, respond) => {
      assert(data, message);
      respond({status: 'ok'});
    });

    await Promise.map(new Array(msgCount), (data, i) => psa.emit(accessor.token, channel, message + i));

    const duration = ((now() - start) / 1000);
    console.log(`throughput ${(msgCount / duration).toFixed(3)} messages/second`);
  });

  it('should disconnect client (from server)', done => {
    psa.Client.once(`disconnect-${accessor.token}`, () => done());
    psa.reject(accessor.token);
  });

  it('should disconnect socket-server', () => {
    psa.disconnect();
    psb.disconnect();
  });
});
