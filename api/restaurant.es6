import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Create a restaurant
 *
 * @param {string} name : Name of restaurant
 * @param {string} password: Password for restaurant login
 * @param {Object} optional : Restaurant phone number is optional
 * @returns {Promise}: Returns the Restaurant object
 */
export function create(name, password, optional = {phoneNumber: null}) {
  return models.Restaurant.create({name, password, ...optional});
}

/**
 * Update a restaurant attributes
 *
 * @param {Number} id: primary key of restaurant
 * @param {Object} attributes : Attributes to update
 * @returns {Promise}: Returns the Restaurant object
 */
export function update(id, attributes) {
  return models.Restaurant.update(
      attributes, {
        where: {id}
      }
  );
}

/**
 * Destroy a restaurant
 *
 * @param {Number} id: primary key of restaurant
 * @returns {Promise}: Returns the Restaurant object
 */
export function destroy(id) {
  return models.Restaurant.destroy({
    where: {id}
  });
}

/**
 * Find a restaurant by id
 *
 * @param {Number} id: primary key of restaurant
 * @returns {Promise}: Returns the Restaurant object
 */
export function findOne(id) {
  return models.Restaurant.findOne({
    where: {id}
  });
}

/**
 * Insert restaurantHour to restaurant if the day is not already defined
 * Otherwise, updates existing entry for the day
 *
 * @param {Number} id: primary key of restaurant to be added to
 * @param {Object} restaurantHour: RestaurantHour information to add to restaurant
 * @returns {Promise}: Returns nothing(?)
 */
export function addOrUpdateHour(id, restaurantHour) {
  return new Promise(resolve => {
    findOne(id).then(restaurant => {
      restaurant.getRestaurantHours({where: {dayOfTheWeek: restaurantHour.dayOfTheWeek}}).then(results => {
        if (results.length === 1) {
          restaurant.removeRestaurantHour(results[0]).then(() => {
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
    findOne(id).then(restaurant => {
      resolve(restaurant.getRestaurantHours());
    });
  });
}
