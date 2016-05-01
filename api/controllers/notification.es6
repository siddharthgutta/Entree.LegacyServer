import ipc from '../../libs/ipc.es6';
import * as SocketTokens from './../socketToken.es6';
import * as Runtime from '../../libs/runtime.es6';
import {GCM} from '../../libs/socket-server/index.es6';
import shortid from 'shortid';
import Promise from 'bluebird';
import * as Restaurants from './../restaurant.es6';
import Events from '../constants/client.es6';
import * as GCMToken from '../gcmToken.es6';

class TokenStore extends GCM.TokenStore {

  async set(token, data) {
    await GCMToken.set(token, JSON.stringify(data));
  }

  async get(token) {
    const doc = await GCMToken.get(token);
    doc.data = JSON.parse(doc.data);
    return doc;
  }

  async has(token) {
    return await GCMToken.has(token);
  }

  async delete(token) {
    try {
      await GCMToken.remove(token);
    } catch (e) {
      // ignore
    }
  }
}

/**
 * SocketIO context for ease of access
 */
export const sio = ipc.Client; // sio
export const gcm = new GCM(ipc, new TokenStore()); // GCM

/**
 * Connect gcm
 */
gcm.connect();

/**
 * sio events
 */
export {Events};

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
      console.tag('notification', 'validate-tokens').log({token});

      try {
        // check if any of them return a response
        await Promise.any([sio.emit(token, 'alive?', {}, waitTime), gcm.emit(token, 'alive?', {}, waitTime)]);
      } catch (e) {
        sio.reject(token);
        gcm.reject(token);

        await rejected(token);
      }
    }, {concurrency: 8});
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
  console.tag('notification', 'validate').log({id});

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
  console.tag('notification', 'createSocket').log({id, token});

  try {
    await SocketTokens.addTokenOrCreate(id, token);
  } catch (e) {
    console.error(new TraceError('Attempting to release tokens', e));

    await validate(id);
    try {
      await SocketTokens.addTokenOrCreate(id, token);
    } catch (ee) {
      throw new TraceError('No more tokens available', ee, e);
    }
  }

  const _sio = await sio.accept(token);
  const _gcm = await gcm.accept(token);

  sio.once(`disconnect-${token}`, () => sio.reject(token));
  gcm.once(`disconnect-${token}`, () => gcm.reject(token));

  console.tag('notification', 'create-socket').log({sio: _sio, gcm: _gcm});

  return {sio: _sio, gcm: _gcm};
}


/**
 * Remove a socket token for a client
 * @param {String} id: SocketToken id
 * @param {String} token: token
 * @returns {null} void
 */
export async function removeSocket(id, token) {
  try {
    await SocketTokens.removeToken(id, token);
  } catch (e) {
    console.tag('notification', 'remove-socket').error(e, {id, token});
  }

  sio.reject(token);
  gcm.reject(token);
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
        sio.volatile(token, channel, data);
        gcm.volatile(token, channel, data);
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
  if (channel === Events.NEW_ORDER) {
    const order = data;
    data.notification = {title: `New Order Received`, body: `Order #${order.id2}: ${order.User.firstName}`};
  }

  console.tag('notification', 'notify').log(id, channel, data);

  try {
    const {tokens} = await SocketTokens.findOne(id);

    for (const token of tokens) {
      sio.volatile(token, channel, data);
      gcm.volatile(token, channel, data);
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
  await Promise.map(tokens, token => sio.emit(token, channel, data, false)); // No awk for regular ones for now
}

export async function address() {
  return {sio: await sio.address(), gcm: await gcm.address(await Runtime.resolveAddress(), '/gcm')};
}

export async function reject(token) {
  // TODO inform before rejecting GCM
  return {sio: await sio.reject(token), gcm: await gcm.reject(token)};
}

export async function accept(token) {
  return {sio: await sio.accept(token), gcm: gcm.accept(token)};
}
