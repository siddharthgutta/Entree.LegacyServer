import config from 'config';
import {LocalSocketServer, RemoteSocketServer} from '../libs/socket-server/index.es6';
import * as SocketTokens from './socketToken.es6';
import shortid from 'shortid';
import Promise from 'bluebird';

let socketServer;
let mode = 'local';

if (config.get('UseRemoteSocketServer')) {
  socketServer = new RemoteSocketServer();
  mode = 'remote';
} else {
  socketServer = new LocalSocketServer();
}

console.tag('notification').log(`Using ${mode} server`);

// bind functions
export const address = socketServer.address.bind(socketServer);
export const reject = socketServer.reject.bind(socketServer);
export const accept = socketServer.accept.bind(socketServer);

socketServer.connect();

// Ensure all stored tokens are still alive;
// otherwise kick them out
export async function validateTokens(tokens, rejected) {
  try {
    const waitTime = 2000;

    // run in parallel
    await Promise.map(tokens, async token => {
      try {
        console.tag('notification', 'validate-tokens', 'check').log({token});

        await socketServer.emit(token, 'alive?', {}, waitTime);
      } catch (e) {
        console.tag('notification', 'validate-tokens', 'not-alive').error(e);
        console.tag('notification', 'validate-tokens', 'not-alive').log({token});

        socketServer.reject(token);
        process.nextTick(() => rejected(token));
      }
    });

    console.tag('notification', 'validate-tokens', 'completed').log({tokens});
  } catch (e) {
    console.tag('notification', 'validate-tokens').error(e);
  }
}

export async function validate(id) {
  try {
    const {tokens} = await SocketTokens.findOne(id);
    await validateTokens(tokens, token => SocketTokens.removeToken(id, token));
  } catch (e) {
    console.tag('notification', 'validate').error(e);
  }
}

export async function createSocket(id, token = shortid.generate()) {
  await validate(id);

  console.tag('notification', 'create-socket').log({id, token});

  try {
    await SocketTokens.addTokenOrCreate(id, token);
  } catch (e) {
    console.tag('notification', 'create-socket').error(e, {id, token});
  }

  const accessor = await accept(token);
  const removeEvent = socketServer.for(socketServer.eventMap.responseClientDisconnected, token);

  socketServer.once(removeEvent, () => {
    SocketTokens.removeToken(id, token);
    reject(token);
  });

  console.tag('notification', 'create-socket').log({accessor});

  return accessor;
}

export async function notifyByToken(token, channel, data) {
  throw new Error('To be implemented', token, channel, data);
}

export async function notify(id, channel, data) {
  console.tag('notification', 'notify').log(id, channel, data);

  try {
    const {tokens} = await SocketTokens.findOne(id);

    for (const token of tokens) {
      socketServer.volatile(token, channel, data);
    }
  } catch (e) {
    console.tag('notification', 'notify').error(e, {id, channel, data});
  }
}
export async function notifyAndWait(id, channel, data) {
  console.tag('notification', 'notify').log(id, channel, data);

  const {tokens} = await SocketTokens.findOne(id);
  await Promise.map(tokens, token => socketServer.emit(token, channel, data, false)); // No awk for regular ones for now
}
