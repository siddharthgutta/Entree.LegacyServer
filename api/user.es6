import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Create a user
 *
 * @param phoneNumber {string} - User phone number
 * @param password {string} - User password
 * @param name {string} - User name
 * @param email {string} - User email
 * @returns {Promise}
 */
export function create(phoneNumber, password, name, email) {
  return models.User.create({phoneNumber, password, name, email});
}

/**
 * Update a user attributes
 *
 * @param phoneNumber {string} - User phone number
 * @param attributes {Object} - Attributes to update
 * @returns {Promise}
 */
export function update(phoneNumber, attributes) {
  return models.User.update(
      attributes, {
        where: {phoneNumber}
      }
  );
}

/**
 * Destroy a user
 *
 * @param phoneNumber {string} - User phone number
 * @returns {Promise}
 */
export function destroy(phoneNumber) {
  return models.User.destroy({
    where: {phoneNumber}
  });
}

/**
 * Find a user by phone
 *
 * @param phoneNumber {string} - User phone number
 * @returns {Promise}
 */
export function findOne(phoneNumber) {
  return models.User.findOne({
    where: {phoneNumber}
  });
}
