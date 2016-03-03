import models from '../models/mongo/index.es6';
import Promise from 'bluebird';

/**
 * IMPORTANT: Must return promises!
 */

const MAX_TOKENS = 4;

/**
 * Adds a token to a specific SocketToken object and increments numTokens count
 * NOTE - If the SocketToken object does not exist, create one and add the input token
 *
 * @param {number} restaurantId: id of restaurant the socket token corresponds to
 * @param {string} token: the token that we want to add
 * @returns {Promise}: Returns the socket token object the token was added to
 */
export function addTokenOrCreate(restaurantId, token) {
  return new Promise((resolve, reject) => {
    models.SocketToken
          .findOneAndUpdate(
            {restaurantId, numTokens: {$lt: MAX_TOKENS}},
            {restaurantId, $push: {tokens: token}, $inc: {numTokens: 1}},
            {new: true, upsert: true}) // TODO @jesse returnNewDocument?
          .exec()
          .then(result => {
            resolve(result);
          }, err => reject(new TraceError(`No entity with tokens < MAX_TOKENS for ${restaurantId}`, err)));
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
          .exec()
          .then(result => {
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
    models.SocketToken
          .findOne({restaurantId, tokens: {$elemMatch: {$in: [token]}}})
          .exec()
          .then(result => {
            resolve(result ? true : false);
          }, err => {
            reject(err);
          });
  });
}

/**
 * Returns the SocketToken object given a individual token
 *
 * @param {string} token: the input token we are querying by
 * @returns {Promise}: returns a SocketToken object
 */
export function findByToken(token) {
  return models.SocketToken.findOne({tokens: {$elemMatch: {$in: [token]}}}).exec();
}

/**
 * Finds a SocketToken object by restaurantId
 *
 * @param {number} restaurantId: id of restaurant the socket token corresponds to
 * @returns {Promise}: Returns the socket token object or rejects with error if nothing is found
 */
export function findOne(restaurantId) {
  return new Promise((resolve, reject) => {
    models.SocketToken.findOne({restaurantId})
          .then(result => {
            if (result) {
              resolve(result);
            } else {
              reject(Error(`SocketToken with ${restaurantId} could not be found`));
            }
          });
  });
}
