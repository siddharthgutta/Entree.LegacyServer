import * as Restaurant from '../restaurant.es6';

import {Mode, MetaData} from '../restaurant.es6';
export {Mode};

export async function setEnabled(id, enabled) {
  return await Restaurant.setEnabled(id, enabled);
}

export async function getRestaurantWithMetaData(id) {
  return await Restaurant.findOneWithMetaData(id, MetaData.ORDER_SUMMARY);
}

/**
 * Expose model
 */
export {Restaurant as RestaurantModel};
