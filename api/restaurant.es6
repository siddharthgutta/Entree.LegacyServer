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
 * @param {Object} optional : Restaurant phone number is optional
 * @returns {Promise}: Returns the Restaurant object
 */

export function create(name, password, mode = Mode.REGULAR, optional = {phoneNumber: null}) {
  return models.Restaurant.create({name, password, mode, ...optional});
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
 * Find restaurants by mode
 *
 * @param {String} mode : Mode of the restaurant
 * @returns {Promise}: Returns the Restaurant objects
 */
export function findByMode(mode) {
  return models.Restaurant.findAll({where: {mode}});
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
export function findOne(id) {
  return models.Restaurant.findOne({where: {id}});
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
    findOne(id)
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
    findOne(id)
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
    findOne(id)
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
  return new Promise(resolve => {
    findOne(id)
    .then(restaurant => {
      restaurant.getLocation()
                .then(location => {
                  resolve(location.destroy());
                });
    });
  });
}

/**
 * Gets the location for the restaurant
 *
 * @param {Number} id: primary key of restaurant to get location of
 * @returns {Promise}: Returns a promise with the Location object
 */
export function getLocation(id) {
  return new Promise(resolve => {
    findOne(id)
    .then(restaurant => {
      resolve(restaurant.getLocation());
    });
  });
}
