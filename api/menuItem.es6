import models from '../models/mongo/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Find menu items by restaurant id
 *
 * @param {number} restaurantId: Id of restaurant
 * @param {Object} optional: additional optional query attributes
 * @returns {Promise}: Returns the menu object
 */
export function find(restaurantId, optional = {}) {
  return models.MenuItem.find({restaurantId, ...optional}).exec();
}

/**
 * Create a menu for a restaurant. For testing purposes
 *
 * @param {Number} restaurantId: Id of restaurant
 * @param {string} category: category of the menu item
 * @param {string} name: name the menu item
 * @param {string} description: description of the menu item
 * @param {Number} price: price of restaurant item
 * @param {boolean} hasSize: true if the menu item has size options
 * @param {Object} sizes: size modifications for the object
 * @param {Object} mods: extra modifications for the menu item
 * @returns {Promise}: Returns the menu object
 */
export function create(
    restaurantId,
    category,
    name,
    description,
    price,
    hasSize,
    sizes,
    mods) {
  return (new models.MenuItem({
    restaurantId,
    category,
    name,
    description,
    price,
    hasSize,
    sizes,
    mods})).save();
}

/* eslint-disable */
export function update(args) {
  /**
   * TO BE IMPLEMENTED
   *  */
}

export function destroy(args) {
  /**
   * TO BE IMPLEMENTED
   *  */
}
