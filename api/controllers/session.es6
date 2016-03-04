import * as AuthToken from '../authToken.es6';
import * as Restaurant from '../restaurant.es6';
import crypto from 'crypto';

export async function create(restaurantId) {
  console.tag('session', 'create').log({restaurantId});

  const token = crypto.randomBytes(20).toString('hex');
  await AuthToken.create(restaurantId, token);
  return token;
}

export async function isValid(token) {
  try {
    const res = await AuthToken.findByToken(token);
    return !!res;
  } catch (e) {
    return false;
  }

  console.tag('session', 'isValid').log({token, valid: !!res});
}

export async function renew(restaurantId, token) {
  console.tag('session', 'renew').log({restaurantId, token});

  try {
    await AuthToken.destroy(token); // FIXME optimize this!
  } catch (e) {
    throw new TraceError(`Could not find token ${token} to destroy`, e);
  }

  return AuthToken.create(restaurantId, token);
}

export async function getRestaurant(token) {
  console.tag('session', 'getRestaurant').log({token});

  const {restaurantId} = await AuthToken.findByToken(token);
  return Restaurant.findOne(restaurantId);
}

export {AuthToken as AuthTokenModel};
