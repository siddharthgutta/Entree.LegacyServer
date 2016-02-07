import models from '../models/mongo/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Find a menu by restaurant id
 *
 * @param {Number} restaurantId: Id of restaurant
 * @returns {Promise}: Returns the menu object
 */
export function getMenuByRestaurantId(restaurantId) {
  return models.Menu.findOne({restaurantId}).exec();
}

/**
 * Create a menu for a restaurant. For testing purposes
 *
 * @param {Number} restaurantId: Id of restaurant
 * @param {Object} menu: The JSON formatted menu of the restaurant
 * @returns {Promise}: Returns the menu object
 */
export function createMenuByRestaurantId(restaurantId, menu) {
  return new models.Menu({restaurantId, menu}).save();
}
