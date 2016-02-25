import './test-init.es6';
import io from 'socket.io-client';
import assert from 'assert';
import {format} from 'url';
import now from 'performance-now';
import _ from 'underscore';
import crypto from 'crypto';
import Promise from 'bluebird';
import {RemoteSocketServer} from '../libs/socket-server/index.es6';

let socket;
let accessor;

const message = global.TEST;
const msgCount = 10;
const channel = 'send';
const ss = new RemoteSocketServer(global.TEST);

describe(global.TEST, () => {
  it('should create socket-server', async () => {
    await ss.connect();
  });

  it('should add token', async () => {
    accessor = await ss.accept(crypto.randomBytes(15)
                                     .toString('hex'));
  });

  it('should connect client', async done => {
    const address = await ss.address();
    const url = format(address);

    console.log(accessor);

    socket = io(url, {query: `id=${accessor.uuid}`, secure: true});
    socket.once('connect', () => done());
  });

  it(`should send ${msgCount} messages to client`, async () => {
    const start = now();

    socket.on(channel, (data, respond) => {
      assert(data, message);
      respond({status: 'ok'});
    });

    await Promise.map(_.range(msgCount), i => ss.emit(accessor.token, channel, message + i));

    const duration = ((now() - start) / 1000);
    console.log(`throughput ${(msgCount / duration).toFixed(3)} messages/second`);
  });

  it('should disconnect client (from server)', done => {
    const event = ss.for(ss.eventMap.responseClientDisconnected, accessor.token);
    ss.once(event, () => done());

    socket.disconnect();
  });

  it('should disconnect socket-server', () => {
    ss.disconnect();
  });

  it('should force exit', () => {
    process.exit(0);
  });
});
