import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Create a location
 *
 * @param {string} firstAddress: address of the restaurant
 * @param {string} city: city of restaurant
 * @param {string} state: state of restaurant. Must be 2 char state code (e.g. TX)
 * @param {string} zipcode: zipcode of restaurant. Must be 5 char ZIP (e.g. 78705)
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
