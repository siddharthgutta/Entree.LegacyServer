import * as Order from '../controllers/order.es6';

/**
 * Checks if two orders are equal by comparing the names of each order item
 *
 * @param {Object} orderA: The first order
 * @param {Object} orderB: The second order
 * @returns {boolean}: True if the orders are equal and false otherwise
 */
export async function isOrderEqual(orderA, orderB) {
  const itemsA = await Order.getItemsFromOrder(orderA.id);
  const itemsB = await Order.getItemsFromOrder(orderB.id);
  if (itemsA.length !== itemsB.length) {
    return false;
  }

  itemsA.sort((itemA, itemB) => itemA.name.localeCompare(itemB.name));
  itemsB.sort((itemA, itemB) => itemA.name.localeCompare(itemB.name));

  for (const idx in itemsA) {
    if (itemsA[idx].name !== itemsB[idx].name) {
      return false;
    }
  }

  return true;
}
