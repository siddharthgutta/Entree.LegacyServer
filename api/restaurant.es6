import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Create a restaurant
 *
 * @param name {string} - Name of restaurant
 * @param password {string} - Password for restaurant login
 * @param optional {Object} - Restaurant phone number is optional
 * @returns {Promise}
 */
export function create(name, password, optional = {phoneNumber: null}) {
  return models.Restaurant.create({name, password, ...optional});
}

/**
 * Update a restaurant attributes
 *
 * @param name {string} - Name of restaurant
 * @param attributes {Object} - Attributes to update
 * @returns {Promise}
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
 * @param name {string} - Name of restaurant
 * @returns {Promise}
 */
export function destroy(name) {
  return models.Restaurant.destroy({
    where: {name}
  });
}

/**
 * Find a restaurant by name
 *
 * @param name {string} - Name of restaurant
 * @returns {Promise}
 */
export function findOne(name) {
  return models.Restaurant.findOne({
    where: {name}
  });
}
