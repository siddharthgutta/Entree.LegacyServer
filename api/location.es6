import models from '../models/mysql/index.es6';

/**
 * Find all locations. For testing purposes
 *
 * @returns {Promise}: Returns list of Location objects
 */
export function findAll() {
  return models.Location.findAll();
}
