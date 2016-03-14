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
 * @param {string} password: Password for restaurant login
 * @param {Object} attributes : Restaurant phone number is optional
 * @returns {Promise}: Returns the Restaurant object
 */
export async function create(name, password, mode = Mode.REGULAR, attributes = {
  phoneNumber: null,
  merchantApproved: null,
  merchantId: null
}) {
  try {
    return (await models.Restaurant.create({name, password, mode, ...attributes}));
  } catch (e) {
    throw new TraceError('Could not create restaurant', e, ...(e.errors || []));
  }
}

/**
 * Find restaurants by mode
 *
 * @param {String} mode : Mode of the restaurant
 * @returns {Promise}: Returns the Restaurant objects
 */
export function findByMode(mode) {
  return models.Restaurant.findAll({where: {mode}});
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
    return (await models.Restaurant.findOne({where: {id}}));
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
    return (await models.Restaurant.findOne(query));
  } catch (e) {
    throw new TraceError('Could not find restaurant', e);
  }
}

/**
 * Find a restaurant by name
 *
 * @param {Number} id: primary key of restaurant to be added to
 * @param {Object} restaurantHour: RestaurantHour information to add to restaurant
 * @returns {Promise}: Returns nothing(?)
 */
export function addOrUpdateHour(id, restaurantHour) {
  return new Promise(resolve => {
    models.Restaurant
          .findOne({where: {id}})
          .then(restaurant => {
            restaurant.getRestaurantHours({where: {dayOfTheWeek: restaurantHour.dayOfTheWeek}})
                      .then(results => {
                        if (results.length === 1) {
                          restaurant.removeRestaurantHour(results[0])
                                    .then(() => {
                                      resolve(restaurant.addRestaurantHour(restaurantHour));
                                    });
                        } else {
                          resolve(restaurant.addRestaurantHour(restaurantHour));
                        }
                      });
          });
  });
}

/**
 * Get RestaurantHours associated with restaurant
 *
 * @param {Number} id: primary key of restaurant to be queried
 * @returns {Promise}: Returns a list of restaurant hours associated with the restaurant
 */
export function getHours(id) {
  return new Promise(resolve => {
    models.Restaurant
          .findOne({where: {id}})
          .then(restaurant => {
            resolve(restaurant.getRestaurantHours());
          });
  });
}

/**
 * Sets the location for a restaurant if no location is set
 * Otherwise, remove the existing location and update it
 *
 * @param {Number} id: primary key of restaurant to be updated
 * @param {Object} location: Location object to be set
 * @returns {Promise}: Returns promise with no data(?)
 */
export function setOrUpdateLocation(id, location) {
  return new Promise(resolve => {
    models.Restaurant
          .findOne({where: {id}})
          .then(restaurant => {
            restaurant.getLocation()
                      .then(result => {
                        if (result) {
                          result.destroy()
                                .then(() => {
                                  resolve(restaurant.setLocation(location));
                                });
                        } else {
                          resolve(restaurant.setLocation(location));
                        }
                      });
          });
  });
}

/**
 * Removes the location for the restaurant with name
 *
 * @param {Number} id: primary key of restaurant to remove location from
 * @returns {Promise}: Returns a promise with no data(?)
 */
export function removeLocation(id) {
  return new Promise((resolve, reject) => {
    models.Restaurant
          .findOne({where: {id}})
          .then(restaurant => {
            restaurant.getLocation()
                      .then(location => {
                        resolve(location.destroy());
                      })
                      .catch(e => {
                        reject(e);
                      });
          })
          .catch(e => {
            reject(e);
          });
  });
}

/**
 * @param {string} name: name of restaurant
 * @returns {Promise}: Returns the Restaurant object
 */
export function findByName(name) {
  return models.Restaurant.findOne({where: {name}});
}

/**
 * Finds all restauarnts
 *
 * @param {number} id: id of restaurant
 * @returns {Promise}: A list of all restaurants
 */
export function getLocation(id) {
  return new Promise(resolve => {
    models.Restaurant
          .findOne({where: {id}})
          .then(restaurant => {
            resolve(restaurant.getLocation());
          });
  });
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
    return await restaurant.update(attributes);
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
