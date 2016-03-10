import models from '../models/mysql/index.es6';

/**
 * Finds a single category
 *
 * @param {number} id: if the category we want
 * @returns {Promise}: category object
 */
export function findOne(id) {
  return models.Category.findOne({where: {id}});
}
/**
 * Find all Categories. For testing purposes
 *
 * @returns {Promise}: Returns list of Category objects
 */
export function findAll() {
  return models.Category.findAll();
}
