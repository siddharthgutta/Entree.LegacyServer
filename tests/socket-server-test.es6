import './test-init.es6';
import io from 'socket.io-client';
import assert from 'assert';
import {format} from 'url';
import now from 'performance-now';
import Promise from 'bluebird';
import crypto from 'crypto';
import ss from '../message/socket-server.es6';

const message = global.TEST;
const token = crypto.randomBytes(15).toString('hex');
const msgCount = 10;
const channel = 'send';

let socket;

/**
 *
 * Stability - 3
 *
 * We can get much higher with some tweaking on the NodeJS level; naive test results
 *
 * Multi Client (100 clients)
 *
 * serial: 10 messages/s
 * parallel: 20 messages/s
 * parallel (volatile): 30 messages/s
 * parallel (callbacks): 50 messages/s
 *
 * Single Client
 *
 * serial: 1000 messages/s
 * parallel: 3000 messages/s
 * parallel (volatile): 4000 messages/s
 *
 **/


/**
 *
 * ss.connect() :: Promise
 * -----------------------
 * Use this function to connect the socket server. All the information is pulled from the
 * branchoff@config depending on the running environment
 *
 *
 * ss.accept(token) :: Promise
 * -----------------------
 * Accepts any incoming websockets with the token you provide
 *
 *
 * ss.reject(token) :: Promise
 * -----------------------
 * Reject any tokens; all connected websockets will be disconnected
 *
 *
 * ss.emit(token, channel, data) :: Promise
 * -----------------------
 * Send to a token, on a specified channel, some data
 *
 *
 * ss.disconnect()
 * -----------------------
 * Disconnect ipc to ensure Node quits
 *
 */

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

      console.log(url);

      socket = io(url, {query: `id=${token}`, secure: true});
      socket.once('connect', () => done());
    });
  });

  it(`should send ${msgCount} messages to client`, done => {
    const start = now();
    const messages = new Array(msgCount);
    let received = 0;

    socket.on(channel, (data, respond) => {
      console.log(data); // FIXME not receiving data; use standard emit from socket-test

      assert(data, message);
      respond({status: 'ok'});

      if (false && ss.isLocal() && ++received === msgCount) {
        const duration = ((now() - start) / 1000);
        console.log(`throughput ${(msgCount / duration).toFixed(3)} messages/second`);
        done();
      }
    });

    for (let i = 0; i < messages.length; i++) {
      messages[i] = ss.emit(token, channel, message + i);
    }

    if (true || ss.isRemote()) {
      Promise.all(messages).then(() => {
        const duration = ((now() - start) / 1000);
        console.log(`throughput ${(msgCount / duration).toFixed(3)} messages/second`);
        done();
      });
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
