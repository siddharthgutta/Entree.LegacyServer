import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Create a user
 *
 * @param phoneNumber
 * @param password
 * @param optional
 * @returns {Promise}
 */
export function create(phoneNumber, password, optional = {name: null, email: null}) {
  return models.User.create({phoneNumber, password, ...optional});
}

/**
 * Update a user attributes
 *
 * @param phoneNumber
 * @param attributes
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
 * @param phoneNumber
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
 * @param phoneNumber
 * @returns {Promise}
 */
export function findOne(phoneNumber) {
  return models.User.findOne({
    where: {phoneNumber}
  });
}
