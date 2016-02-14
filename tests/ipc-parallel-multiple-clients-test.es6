import {getSocketServer} from './test-init.es6';
import io from 'socket.io-client';
import assert from 'assert';
import _ from 'underscore';
import async from 'async';
import {format} from 'url';
import now from 'performance-now';
import crypto from 'crypto';
import Promise from 'bluebird';

const socketServer = getSocketServer();
const message = global.TEST;
const clientCount = 5;
const msgCount = 5;
const channel = 'channel-0';

let accessors;
const sockets = new Array(clientCount);
const range = _.range(clientCount);

describe(global.TEST, () => {
  it('should create socket-server', async () => {
    await socketServer.connect();
  });

  it('should add accessors', async () => {
    accessors = await Promise.map(range, () => socketServer.accept(crypto.randomBytes(15).toString('hex')));
  });

  it('should connect clients', async done => {
    const address = await socketServer.address();
    const url = format(address);

    async.each(range, (idx, callback) => {
      const socket = io(url, {query: `id=${accessors[idx].uuid}`, secure: true});
      socket.once('connect', () => callback());

      sockets[idx] = socket;
    }, () => done());
  });

  it(`should send ${msgCount} messages to each client`, async () => {
    const start = now();

    await Promise.map(range, async idx => {
      const socket = sockets[idx];
      const token = accessors[idx].token;

      socket.on(channel, (data, respond) => {
        assert(data, message);
        respond({status: 'ok'});
      });

      await Promise.map(new Array(msgCount), () => socketServer.emit(token, channel, message));
    });

    const duration = ((now() - start) / 1000);
    console.log(`throughput ${(msgCount / duration).toFixed(3)} messages/second`);
  });

  it('should disconnect client (from server)', done => {
    async.each(range, (idx, callback) => {
      const token = accessors[idx].token;
      socketServer.once(`client-disconnected-${token}`, () => callback());
    }, () => done());

    _.each(range, idx => socketServer.reject(accessors[idx].token));
  });

  it('should disconnect socket-server', () => {
    socketServer.disconnect();
  });

  it('should force exit', () => {
    process.exit(0);
  });
});
