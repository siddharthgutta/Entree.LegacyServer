import models from '../models/mongo/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Finds a gcm token by token
 *
 * @param {String} token: input token
 * @returns {Promise}: an auth token
 */
export async function get(token) {
  return await models.GcmToken.findOne({token}).exec();
}

/**
 * Creates a gcm token
 *
 * @param {String} token: input token value
 * @param {String} data: data value
 * @returns {Promise}: an auth token
 */
export async function set(token, data) {
  const tokenObj = await get(token);
  if (tokenObj) {
    await models.GcmToken.update({token}, {data}).exec();
    return await get(token);
  }

  return await (new models.GcmToken({token, data})).save();
}

/**
 * Finds a gcm token by token
 *
 * @param {String} token: input token
 * @returns {boolean}: true if token exists, and false otherwise
 */
export async function has(token) {
  return !!(await models.GcmToken.findOne({token}).exec());
}

/**
 * Removes a gcm token
 *
 * @param {String} token: the token to be removed
 * @returns {Promise}: Returns an error if something went wrong
 */
export async function remove(token) {
  return await models.GcmToken.remove({token}).exec();
}
