import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Create a location
 *
 * @param {string} firstAddress: address of the restaurant
 * @param {string} city: city of restaurant
 * @param {string} state: state of restaurant
 * @param {string} zipcode: zipcode of restaurant
 * @param {Object} optional: secondAddress is optional
 * @returns {Promise}: Returns the Location object
 */
export function create(firstAddress, city, state, zipcode, optional = {secondAddress: null}) {
  return models.Location.create({firstAddress, city, state, zipcode, ...optional});
}


/**
 * Find all locations. For testing purposes
 *
 * @returns {Promise}: Returns list of Location objects
 */
export function findAll() {
  return models.Location.findAll();
}
