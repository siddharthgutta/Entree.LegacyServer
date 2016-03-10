import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Finds all restaurant hours. For testing purposes
 *
 * @returns {Promise}: Returns the RestaurantHour object
 */
export function findAll() {
  return models.RestaurantHour.findAll();
}
