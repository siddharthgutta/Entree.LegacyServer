import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

import {Mode} from '../models/mysql/restaurant.es6';
export {Mode};

/**
 * Create a restaurant
 *
 * @param {string} name : Name of restaurant
 * @param {string} handle: Restaurant handle
 * @param {string} password: Password for restaurant login
 * @param {string} mode: mode of the restaurant
 * @param {Object} attributes : Restaurant phone number is optional
 * @returns {Promise}: Returns the Restaurant object
 */
export async function create(name, handle, password, mode = Mode.REGULAR, attributes = {
  phoneNumber: null,
  merchantApproved: null,
  merchantId: null
}) {
  try {
    return (await models.Restaurant.create({name, handle, password, mode, ...attributes})).toJSON();
  } catch (e) {
    throw new TraceError('Could not create restaurant', e, ...(e.errors || []));
  }
}

/**
 * Find restaurants by mode
 *
 * @param {string} mode : Mode of the restaurant
 * @param {Object} attributes: specific restaurant attributes to search by
 * @returns {Promise}: Returns the Restaurant objects
 */
export function findByMode(mode = Mode.REGULAR, attributes = {enabled: true}) {
  return models.Restaurant.findAll({where: {mode, ...attributes}});
}

/**
 * Find restaurants by merchantId
 *
 * @param {String} merchantId : merchantId of the restaurant
 * @returns {Promise}: Returns a Restaurant object
 */
export function findByMerchantId(merchantId) {
  return models.Restaurant.findOne({where: {merchantId}});
}


/**
 * Destroy a restaurant
 *
 * @param {Number} id: primary key of restaurant
 * @returns {Promise}: Returns the Restaurant object
 */
export function destroy(id) {
  return models.Restaurant.destroy({where: {id}});
}

/**
 * Find a restaurant by id
 *
 * @param {Number} id: primary key of restaurant
 * @returns {Promise}: Returns the Restaurant object
 */
export async function findOne(id) {
  try {
    return (await models.Restaurant.findOne({where: {id}})).toJSON();
  } catch (e) {
    throw new TraceError('Could not find restaurant', e);
  }
}

export const MetaData = {
  ORDERS: Symbol(),
  ORDERS_ITEMS: Symbol(),
  ORDER_SUMMARY: 'OrderSummary'
};

/**
 * Find a restaurant by id (with order information)
 *
 * @param {Number} id: primary key of restaurant
 * @param {Symbol|String} metadata: how much information you want
 * @returns {Promise}: Returns the Restaurant object
 */
// TODO @jesse can you make a versatile findOne
export async function findOneWithMetaData(id, ...metadata) {
  const {Order, Item, sequelize} = models;
  const query = {where: {id}};

  // TODO @jesse loop through and build query?
  switch (metadata[0]) {
    case MetaData.ORDERS:
      query.include = [{model: Order}];
      break;
    case MetaData.ORDERS_ITEMS:
      query.include = [{model: Order, include: [{model: Item}]}];
      break;
    default:
    case MetaData.ORDER_SUMMARY:
      query.include = [{
        model: Order,
        attributes: [
          ['id', 'orderId'],
          [sequelize.fn('SUM', sequelize.col('price')), 'netPrice'],
          [sequelize.fn('COUNT', sequelize.col('itemId')), 'netItemsCount'],
          [sequelize.fn('COUNT', sequelize.col('orderId')), 'netCount']
        ],
        include: [{
          model: Item,
          attributes: [
            ['id', 'itemId'],
            ['price', 'price']
          ]
        }],
        group: ['orderId']
      }];
  }

  try {
    return (await models.Restaurant.findOne(query)).toJSON();
  } catch (e) {
    throw new TraceError('Could not find restaurant', e);
  }
}


/**
 * @param {string} name: name of restaurant
 * @returns {Promise}: Returns the Restaurant object
 */
export async function findByName(name) {
  return (await models.Restaurant.findOne({where: {name}})).toJSON();
}

/**
 * Get all restaurants
 *
 * @returns {Promise<Array<Restaurant>>}: A list of all restaurnts
 */
export function findAll() {
  return models.Restaurant.findAll();
}

/**
 * Update a restaurant attributes
 *
 * @param {Number} id: primary key of restaurant
 * @param {Object} attributes : Attributes to update
 * @returns {Promise}: Returns the Restaurant object
 */
export async function update(id, attributes) {
  try {
    const restaurant = await models.Restaurant.findOne({where: {id}});
    return (await restaurant.update(attributes)).toJSON();
  } catch (e) {
    throw new TraceError('Could not update restaurant', e);
  }
}


/**
 * Set whether the restaurant is accepting orders
 *
 * @param {Number} id: primary key of restaurant
 * @param {boolean} enabled : accepting orders
 * @returns {Promise}: Returns the Restaurant object
 */
export async function setEnabled(id, enabled) {
  return await update(id, {enabled});
}
