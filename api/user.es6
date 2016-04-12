import models from '../models/mysql/index.es6';
import {UserSecret} from '../models/mongo/index.es6';


/**
 * IMPORTANT: Must return promises!
 */

/**
 * Returns an array of all users
 *
 * @returns {Array<Promise>}: array of users
 */
export function findAll() {
  return models.User.findAll();
}

/**
 * Create a user
 *
 * @param {string} phoneNumber: user phone number
 * @param {string} firstName: user first name
 * @param {string} lastName: user last name
 * @param {string} email: user email
 * @returns {Promise}: Returns the user object
 */
export function create(phoneNumber, {firstName, lastName, email}) {
  return models.User.create({phoneNumber, firstName, lastName, email});
}

/**
 * Find a user by id
 *
 * @param {string} userId: User id
 * @returns {Promise}: Returns the user object
 */
export function findOne(userId) {
  return models.User.findOne({where: {id: userId}});
}

/**
 * Update a user attributes
 *
 * @param {string} phoneNumber: User phone number
 * @param {Object} attributes: Attributes to update
 * @returns {Promise}: Returns the user object
 */
export async function updateByPhoneNumber(phoneNumber, attributes) {
  const user = await models.User.findOne({where: {phoneNumber}});
  return user.update(attributes);
}

/**
 * Update a user attributes
 *
 * @param {string} id: User id
 * @param {Object} attributes: Attributes to update
 * @returns {Promise}: Returns the user object
 */
export async function update(id, attributes) {
  const user = await models.User.findOne({where: {id}});
  return user.update(attributes);
}

/**
 * Destroy a user
 *
 * @param {string} phoneNumber: User phone number
 * @returns {Promise}: Returns the user object
 */
export function destroyByPhoneNumber(phoneNumber) {
  return models.User.destroy({where: {phoneNumber}});
}

/**
 * Find a user by phone
 *
 * @param {string} phoneNumber: User phone number
 * @returns {Promise}: Returns the user object
 */
export function findOneByPhoneNumber(phoneNumber) {
  return models.User.findOne({where: {phoneNumber}});
}


/**
 * Create a secret id for a user
 *
 * @param {string} userId: user id
 * @returns {Promise}: Returns the secret object
 */
export async function createSecret(userId) {
  // TODO test if user exists
  try {
    return await new UserSecret({userId}).save();
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
  const {userId} = await UserSecret.findOne({secret}).exec();
  return findOne(userId);
}

export async function findUserSecret(userId) {
  const {secret} = await UserSecret.findOne({userId}).exec();
  return secret;
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
