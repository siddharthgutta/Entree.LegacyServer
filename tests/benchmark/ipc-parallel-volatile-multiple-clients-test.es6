import '../test-init.es6';
import io from 'socket.io-client';
import assert from 'assert';
import _ from 'underscore';
import async from 'async';
import {format} from 'url';
import now from 'performance-now';
import crypto from 'crypto';
import Promise from 'bluebird';
import ss from '../../message/socket-server.es6';

const message = global.TEST;
const clientCount = 100;
const msgCount = 100;
const channel = 'send';

let tokens;
const sockets = new Array(clientCount);
const range = _.range(clientCount);

describe(global.TEST, () => {
  it('should create socket-server', done => {
    ss.connect().then(() => done());
  });

  it('should add tokens', done => {
    Promise.all(_.map(range, () => ss.accept(crypto.randomBytes(15).toString('hex'))))
        .then(_tokens => tokens = _tokens)
        .then(() => done());
  });

  it('should connect clients', done => {
    ss.address().then(address => {
      const url = format(address);

      async.each(range, (idx, callback) => {
        const socket = io(url, {query: `id=${tokens[idx]}`, secure: true});
        socket.once('connect', () => callback());

        sockets[idx] = socket;
      }, () => done());
    });
  });

  it(`should send ${msgCount} messages to each client`, done => {
    const start = now();

    async.each(range, (idx, callback) => {
      const socket = sockets[idx];
      const token = tokens[idx];
      let received = 0;

      socket.on(channel, data => {
        assert(data, message);

        if (++received === msgCount) {
          process.nextTick(callback);
        }
      });

      for (let i = 0; i < msgCount; i++) {
        ss.volatile(token, channel, message);
      }
    }, () => {
      const duration = ((now() - start) / 1000);
      console.log(`throughput ${(msgCount / duration).toFixed(3)} messages/second`);
      done();
    });
  });

  it('should disconnect client (from server)', done => {
    if (ss.isLocal()) {
      return done();
    }

    async.each(range, (idx, callback) => {
      const token = tokens[idx];
      const event = ss.for(ss.eventMap.responseClientDisconnected, token);
      ss.once(event, () => callback());
    }, () => done());

    _.each(range, idx => ss.reject(tokens[idx]));
  });

  it('should disconnect socket-server', () => {
    ss.disconnect();
  });

  it('should force exit', () => {
    process.exit(0);
  });
});
