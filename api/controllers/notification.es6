import config from 'config';
import {LocalSocketServer, RemoteSocketServer} from '../../libs/socket-server/index.es6';
import * as SocketTokens from './../socketToken.es6';
import shortid from 'shortid';
import Promise from 'bluebird';
import * as Restaurants from './../restaurant.es6';

/**
 * Select the socket server strategy
 */
let ss;
if (config.get('UseRemoteSocketServer')) {
  ss = new RemoteSocketServer();
} else {
  ss = new LocalSocketServer();
}

/**
 * Client context for ease of access
 */
const {Client} = ss;

/**
 * Start connecting to socket server
 */
ss.connect();


/**
 * Client events
 */
export {default as Events} from '../constants/client.es6';

/**
 * Tokens are validated to see if they are still responding
 * @param {[String]} tokens: tokens to validate
 * @param {Function} rejected: function called upon rejection; token will be passed in
 * @returns {null} void
 */
export async function validateTokens(tokens, rejected) {
  try {
    const waitTime = 2000;

    // run in parallel
    await Promise.map(tokens, async token => {
      try {
        console.tag('notification', 'validate-tokens', 'check').log({token});

        await Client.emit(token, 'alive?', {}, waitTime);
      } catch (e) {
        console.tag('notification', 'validate-tokens', 'not-alive').log({token});

        Client.reject(token);

        await rejected(token);
      }
    });

    console.tag('notification', 'validate-tokens', 'completed').log({tokens});
  } catch (e) {
    console.tag('notification', 'validate-tokens').error(e);
  }
}

/**
 * Validate tokens associated with a SocketToken
 * @param {number} id: SocketToken id
 * @returns {null} void
 */
export async function validate(id) {
  try {
    const {tokens} = await SocketTokens.findOne(id);
    await validateTokens(tokens, token => SocketTokens.removeToken(id, token));
  } catch (e) {
    // console.tag('notification', 'validate').warn(e);
  }
}

/**
 * Check if a socket is still valid
 * @param {number} id: SocketToken id
 * @param {String} token: token to test
 * @returns {Object} accessor object {uuid,token}
 */
export async function isValidSocket(id, token) {
  try {
    return SocketTokens.isValidToken(id, token);
  } catch (e) {
    return false;
  }
}

/**
 * Create a socket token for a client to connect
 * @param {number} id: SocketToken id
 * @param {String} token: (optional)
 * @returns {Object} accessor object {uuid,token}
 */
export async function createSocket(id, token = shortid.generate()) {
  await validate(id);

  console.tag('notification', 'create-socket').log({id, token});

  try {
    await SocketTokens.addTokenOrCreate(id, token);
  } catch (e) {
    throw new TraceError('No more tokens available', e);
  }

  const accessor = await Client.accept(token);

  Client.once(`disconnect-${token}`, () => {
    SocketTokens.removeToken(id, token);
    Client.reject(token);
  });

  console.tag('notification', 'create-socket').log({accessor});

  return accessor;
}


/**
 * Remove a socket token for a client
 * @param {String} id: SocketToken id
 * @param {String} token: token
 * @returns {null} void
 */
export async function removeSocket(id, token) {
  await validate(id);

  console.tag('notification', 'remove-socket').log({id, token});

  try {
    await SocketTokens.removeToken(id, token);
  } catch (e) {
    console.tag('notification', 'remove-socket').error(e, {id, token});
  }

  Client.reject(token);
}


/**
 * Notify all God mode accounts
 * @param {String} channel: channel to emit
 * @param {Object} data: data to be sent client
 * @returns {null} void
 */
export async function notifyGods(channel, data) {
  console.tag('notification', 'notify-gods').log(channel, data);

  try {
    const restaurants = await Restaurants.findByMode(Restaurants.Mode.GOD);

    await Promise.map(restaurants, async({id}) => {
      const {tokens} = await SocketTokens.findOne(id);
      for (const token of tokens) {
        Client.volatile(token, channel, data);
      }
    });
  } catch (e) {
    // console.tag('notification', 'notify-gods').error(e, {channel, data});
  }
}

/**
 * Notify all clients attached to a SocketToken
 * @param {number} id: SocketToken id
 * @param {String} channel: channel to emit
 * @param {Object} data: data to be sent client
 * @returns {null} void
 */
export async function notify(id, channel, data) {
  console.tag('notification', 'notify').log(id, channel, data);

  try {
    const {tokens} = await SocketTokens.findOne(id);

    for (const token of tokens) {
      Client.volatile(token, channel, data);
    }
  } catch (e) {
    console.tag('notification', 'notify').error(e, {id, channel, data});
  }

  notifyGods(channel, data);
}

/**
 * Notify all clients attached to a SocketToken
 * @param {number} id: SocketToken id
 * @param {String} channel: channel to emit
 * @param {Object} data: data to be sent client
 * @returns {Object} responses of each client
 * @note WIP
 */
export async function notifyAndWait(id, channel, data) {
  console.tag('notification', 'notify').log(id, channel, data);

  const {tokens} = await SocketTokens.findOne(id);
  await Promise.map(tokens, token => Client.emit(token, channel, data, false)); // No awk for regular ones for now
}

/**
 * Fetch the socket server port for the client
 * @type {function(this:*)}
 * @returns {Object} {protocol, hostname, path, port, search}
 */
export const address = ss.address.bind(ss);

/**
 * Reject a token
 */
export const reject = Client.reject.bind(ss);

/**
 * Accept a token
 */
export const accept = Client.accept.bind(ss);

/**
 * SocketServer object
 */
export const SocketServer = ss;

/**
 * Disconnect socket server (for testing only)
 */
export const _disconnect = ss.disconnect.bind(ss);
