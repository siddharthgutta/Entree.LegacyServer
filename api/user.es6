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
 * Create a user for fb messenger
 *
 * @param {string} fbId: FB messenger id for user
 * @param {string} firstName: user first name
 * @param {string} lastName: user last name
 * @returns {Promise}: Returns the user object
 */
export async function createFbUser(fbId, firstName, lastName) {
  return models.User.create({fbId, firstName, lastName});
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
 * Find a user by facebook id
 *
 * @param {string} fbId: User phone number
 * @returns {Promise}: Returns the user object
 */
export async function findOneByFbId(fbId) {
  return await models.User.findOne({where: {fbId}});
}

/**
 * Find a user's restaurant wish list
 *
 * @param {string} fbId: User's fb ID
 * @returns {Promise}: Returns the user object
 */
export async function findWishList(fbId) {
  const user = await findOneByFbId(fbId);
  return await user.getWishListPlaces();
}

/**
 * Adds a new place to a users wish list
 *
 * @param {String} fbId: users's FB id
 * @param {String} placeId: Google's place id of the place to add
 * @returns {Object}: The wishListPlace object we just added
 */
export async function addToWishList(fbId, placeId) {
  const user = await findOneByFbId(fbId);
  const place = await models.WishListPlace.create({placeId});
  await user.addWishListPlace(place);
  return place;
}

/**
 * Checks if a user has a place on wishlist already
 *
 * @param {String} fbId: users's FB id
 * @param {String} placeId: Google's place id of the place to checck
 * @returns {boolean}: true if this place exists and false otherwise
 */
export async function hasWishListPlace(fbId, placeId) {
  const user = await findOneByFbId(fbId);
  const places = await user.getWishListPlaces({where: {placeId}});
  return places.length !== 0;
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
 * Adds a new location for a user, and sets it to the default location
 *
 * @param {String} fbId: fbid of user
 * @param {Number} latitude: lat of location
 * @param {Number} longitude: long of location
 * @returns {Object} the UserLocation object added
 */
export async function addLocation(fbId, latitude, longitude) {
  const user = await findOneByFbId(fbId);

  /* Set all other locations to be false */
  await models.UserLocation.update({default: false}, {where: {UserId: user.id}});

  const location = await models.UserLocation.create({latitude, longitude, default: true});
  await user.addUserLocation(location);

  return location;
}

/**
 * Returns the default location for the user
 *
 * @param {String} fbId: the fbId of the user we are searching for
 * @returns {Object} the UserLocation object
 */
export async function getDefaultLocation(fbId) {
  const user = await findOneByFbId(fbId);
  const locations = await user.getUserLocations({where: {default: true}});
  if (locations.length !== 1) {
    console.tag('api', 'user', 'LOCATION ERROR').log(`User with fbId ${fbId} has duplicate default locaitons`);
  }

  return locations[0];
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
