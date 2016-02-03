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

/**
 * Sets the location for a restaurant if no location is set
 * Otherwise, remove the existing location and update it
 *
 * @param {string} name: Name of restaurant to modify
 * @param {Object} location: Location object to be set
 * @returns {Promise}: Returns promise with no data(?)
 */
export function setOrUpdateLocation(name, location) {
  return new Promise(resolve => {
    findOne(name).then(restaurant => {
      restaurant.getLocation().then(result => {
        if (result) {
          result.destroy().then(() => {
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
 * @param {string} name: name of restaurant to modify
 * @returns {Promise}: Returns a promise with no data(?)
 */
export function removeLocation(name) {
  return new Promise(resolve => {
    findOne(name).then(restaurant => {
      restaurant.getLocation().then(location => {
        resolve(location.destroy());
      });
    });
  });
}

/**
 * Gets the location for the restaurant
 *
 * @param {string} name: name of restaurant to modify
 * @returns {Promise}: Returns a promise with the Location object
 */
export function getLocation(name) {
  return new Promise(resolve => {
    findOne(name).then(restaurant => {
      resolve(restaurant.getLocation());
    });
  });
}
