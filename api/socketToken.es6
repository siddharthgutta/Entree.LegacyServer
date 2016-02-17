import models from '../models/mongo/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

const MAX_TOKENS = 4;

/**
 * Create a socket token
 *
 * @param {number} restaurantId: id of restaurant the socket token corresponds to
 * @param {Object} optional: optional list of starting tokens
 * @returns {Promise}: Returns the socket token object created
 */
export function create(restaurantId, optional = {tokens: []}) {
  return new Promise((resolve, reject) => {
    const numTokens = optional.tokens.length;
    if (numTokens > MAX_TOKENS) {
      reject(Error(`Tried to create socketToken with ${optional.tokens.length} tokens.` +
        `Maximum is ${MAX_TOKENS} tokens`));
    } else {
      models.SocketToken.create({restaurantId, numTokens, ...optional}, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    }
  });
}

/**
 * Adds a token to a specific socket token object and increments numTokens count
 *
 * @param {number} restaurantId: id of restaurant the socket token corresponds to
 * @param {string} token: the token that we want to add
 * @returns {Promise}: Returns the socket token object the token was added to
 */
export function addToken(restaurantId, token) {
  return new Promise((resolve, reject) => {
    models.SocketToken.findOneAndUpdate(
      {restaurantId, numTokens: {$lt: MAX_TOKENS}},
      {$push: {tokens: token}, $inc: {numTokens: 1}},
      {new: true})
      .exec().then(result => {
        if (result) {
          resolve(result);
        } else {
          reject(Error(`Could not find valid SocketToken. Either restaurantId ${restaurantId} is ` +
            `invalid or the SocketToken already has max number of tokens`));
        }
      }, err => reject(err));
  });
}

/**
 * Removes a token from a specific socket token object and decrements the numTokens count
 *
 * @param {number} restaurantId: id of restaurant the socket token corresponds to
 * @param {string} token: the token that we want to remove
 * @returns {Promise}: Returns the socket token object the token was removed from
 */
export function removeToken(restaurantId, token) {
  return new Promise((resolve, reject) => {
    models.SocketToken.findOneAndUpdate(
      {restaurantId, tokens: {$elemMatch: {$in: [token]}}},
      {$pull: {tokens: token}, $inc: {numTokens: -1}},
      {new: true})
      .exec().then(result => {
        if (result) {
          resolve(result);
        } else {
          reject(Error(`Could not find valid SocketToken. Either restaurantId ${restaurantId} ` +
            `is invalid or token ${token} does not exist for given SocketToken`));
        }
      }, err => reject(err));
  });
}

/**
 * Returns if a given token is valid for a restaurantId
 *
 * @param {number} restaurantId: id of restaurant the socket token corresponds to
 * @param {string} token: the token that we want to remove
 * @returns {Promise}: Returns a true if the token is valid and false otherwise
 */
export function isValidToken(restaurantId, token) {
  return new Promise((resolve, reject) => {
    models.SocketToken.findOne({restaurantId, tokens: {$elemMatch: {$in: [token]}}})
      .exec().then(result => {
        resolve(result ? true : false);
      }, err => {
        reject(err);
      });
  });
}
