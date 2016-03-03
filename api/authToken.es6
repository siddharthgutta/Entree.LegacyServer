import models from '../models/mongo/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Creates an auth token
 *
 * @param {number} restaurantId: restaurantId of token to be created
 * @param {String} token: the token value
 * @returns {Promise}: an auth token
 */
export async function create(restaurantId, token) {
  return await models.AuthToken.create({restaurantId, token});
}

/**
 * Finds a auth token by restaurantId
 *
 * @param {number} restaurantId: input restaurantId
 * @returns {Promise}: an auth token
 */
export async function findById(restaurantId) {
  return await models.AuthToken.findOne({restaurantId});
}

/**
 * Finds a auth token by token
 *
 * @param {String} token: input token
 * @returns {Promise}: an auth token
 */
export async function findByToken(token) {
  return await models.AuthToken.findOne({token});
}

/**
 * Removes an auth token
 *
 * @param {String} token: the token to be removed
 * @returns {Promise}: Returns an error if something went wrong
 */
export async function destroy(token) {
  return await models.AuthToken.remove({token});
}
