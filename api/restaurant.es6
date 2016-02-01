import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Create a restaurant
 *
 * @param {string} name : Name of restaurant
 * @param {string} password: Password for restaurant login
 * @param {Object} optional : Restaurant phone number is optional
 * @returns {Promise}: Promise
 */
export function create(name, password, optional = {phoneNumber: null}) {
  return models.Restaurant.create({name, password, ...optional});
}

/**
 * Update a restaurant attributes
 *
 * @param {string} name: Name of restaurant
 * @param {Object} attributes : Attributes to update
 * @returns {Promise}: Promise
 */
export function update(name, attributes) {
  return models.Restaurant.update(
      attributes, {
        where: {name}
      }
  );
}

/**
 * Destroy a restaurant
 *
 * @param {string} name: Name of restaurant
 * @returns {Promise}: Promise
 */
export function destroy(name) {
  return models.Restaurant.destroy({
    where: {name}
  });
}

/**
 * Find a restaurant by name
 *
 * @param {string} name: Name of restaurant
 * @returns {Promise} - Promise
 */
export function findOne(name) {
  return models.Restaurant.findOne({
    where: {name}
  });
}
