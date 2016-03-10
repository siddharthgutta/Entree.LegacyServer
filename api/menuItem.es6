import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Finds a single menu item
 *
 * @param {Number} id: id of menu item
 * @returns {Promise}: returns the menu item object
 */
export function findOne(id) {
  return models.MenuItem.findOne({where: {id}});
}
