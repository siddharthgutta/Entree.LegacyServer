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
 * @param {string} name: Name of restaurant
 * @param {Object} attributes : Attributes to update
 * @returns {Promise}: Returns the Restaurant object
 */
export function update(name, attributes) {
  return models.Restaurant.update(
      attributes, {
        where: {name}
      }
  );
}

/**
 * Destroy a restaurant
 *
 * @param {string} name: Name of restaurant
 * @returns {Promise}: Returns the Restaurant object
 */
export function destroy(name) {
  return models.Restaurant.destroy({
    where: {name}
  });
}

/**
 * Find a restaurant by name
 *
 * @param {string} name: Name of restaurant
 * @returns {Promise}: Returns the Restaurant object
 */
export function findOne(name) {
  return models.Restaurant.findOne({
    where: {name}
  });
}

/**
 * Insert restaurantHour to restaurant if the day is not already defined
 * Otherwise, updates existing entry for the day
 *
 * @param {string} name: Restaurant name to be added to
 * @param {Object} restaurantHour: RestaurantHour information to add to restaurant
 * @returns {Promise}: Returns nothing(?)
 */
export function addOrUpdateHour(name, restaurantHour) {
  return new Promise(resolve => {
    findOne(name).then(restaurant => {
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
 * @param {string} name: Restaurant name to be queried
 * @returns {Promise}: Returns a list of restaurant hours associated with the restaurant
 */
export function getHours(name) {
  return new Promise(resolve => {
    findOne(name).then(restaurant => {
      resolve(restaurant.getRestaurantHours());
    });
  });
}
