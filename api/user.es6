import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Create a user
 *
 * @param {string} phoneNumber: User phone number
 * @param {string} password: User password
 * @param {string} name: User name
 * @param {string} email: User email
 * @returns {Promise}: Returns the user object
 */
export function create(phoneNumber, password, name, email) {
  return models.User.create({phoneNumber, password, name, email});
}

/**
 * Update a user attributes
 *
 * @param {string} phoneNumber: User phone number
 * @param {Object} attributes: Attributes to update
 * @returns {Promise}: Returns the user object
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
 * @param {string} phoneNumber: User phone number
 * @returns {Promise}: Returns the user object
 */
export function destroy(phoneNumber) {
  return models.User.destroy({
    where: {phoneNumber}
  });
}

/**
 * Find a user by phone
 *
 * @param {string} phoneNumber: User phone number
 * @returns {Promise}: Returns the user object
 */
export function findOne(phoneNumber) {
  return models.User.findOne({
    where: {phoneNumber}
  });
}
