/**
 * Created by kfu on 3/14/16.
 */

import models from '../models/mysql/index.es6';

/**
 * Finds a Mod
 *
 * @param {number} id: id of mod
 * @returns {Promise}: returns the mod
 */
export function findOne(id) {
  return models.Mod.findOne({where: {id}});
}
