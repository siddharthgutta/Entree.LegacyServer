import models from '../models/mysql/index.es6';

/**
 * Finds a Item Mod
 *
 * @param {number} id: id of item mod
 * @returns {Promise}: returns the item mod
 */
export function findOne(id) {
  return models.ItemMod.findOne({where: {id}});
}
