import * as Restaurant from '../restaurant.es6';
import * as Notification from './notification.es6';
import {Mode, MetaData} from '../restaurant.es6';
import Emitter, {Events} from '../events/index.es6';
export {Mode};

export async function getRestaurantWithMetaData(id) {
  return await Restaurant.findOneWithMetaData(id, MetaData.ORDER_SUMMARY);
}

export async function notify(id) {
  await Notification.notify(id, Notification.Events.RESTAURANT_UPDATED, await getRestaurantWithMetaData(id));
}

Emitter.on(Events.ORDER_UPDATED, async(order, prev, restaurantId) => {
  notify(restaurantId);
});

export async function setEnabled(id, enabled) {
  const restaurant = await Restaurant.setEnabled(id, enabled);

  notify(id);

  return restaurant;
}

/**
 * Expose model
 */
export {Restaurant as RestaurantModel};
