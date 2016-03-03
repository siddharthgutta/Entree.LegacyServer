import models from '../models/mysql/index.es6';
import {UserSecret} from '../models/mongo/index.es6';


/**
 * IMPORTANT: Must return promises!
 */

/**
 * Create a user
 *
 * @param {string} phoneNumber: User phone number
 * @param {string} name: User name
 * @param {string} email: User email
 * @returns {Promise}: Returns the user object
 */
export function create(phoneNumber, name, email) {
  return models.User.create({phoneNumber, name, email});
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
  return models.User.destroy({where: {phoneNumber}});
}

/**
 * Find a user by phone
 *
 * @param {string} phoneNumber: User phone number
 * @returns {Promise}: Returns the user object
 */
export function findOne(phoneNumber) {
  return models.User.findOne({where: {phoneNumber}});
}

/**
 * Create a secret id for a user
 *
 * @param {string} phoneNumber: user phone number
 * @returns {Promise}: Returns the secret object
 */
export async function createSecret(phoneNumber) {
  // TODO test if user exists
  try {
    return await new UserSecret({phoneNumber}).save();
  } catch (e) {
    if (e.name === 'ValidationError') {
      throw new TraceError(`Validation failed for fields`, e, ...Object.values(e.errors));
    }

    throw e;
  }
}

/**
 * Find a user by a secret id
 *
 * @param {string} secret: the secret id
 * @returns {Promise}: Returns the user object
 */
export async function findBySecret(secret) {
  const {phoneNumber} = await UserSecret.findOne({secret}).exec();
  return findOne(phoneNumber);
}

/**
 * Destroy the secret id; user remains intact
 *
 * @param {string} secret: the secret id
 * @returns {Promise}: Returns the secret object which was deleted
 * @note secrets are automatically expired after 5m
 */
export async function destroySecret(secret) {
  return UserSecret.findOneAndRemove({secret}).exec();
}

/**
 * Raw db connection exposed;
 */

// TODO @jesse please remove this; dependency is in controller/user.es6
export {models as connection};
