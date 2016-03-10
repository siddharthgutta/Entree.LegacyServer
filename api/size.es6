import models from '../models/mysql/index.es6';

/**
 * Finds a single size object
 *
 * @param {number} id: id of the size object
 * @returns {Promise}: returns the size object
 */
export function findOne(id) {
  return models.Size.findOne({where: {id}});
}
