import models from '../models/mysql/index.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Create a restaurantHour
 *
 * @param {string} dayOfTheWeek : day of the week
 * @param {string} openTime : Time the restaurant opens. Format is "HH:MM:SS""
 * @param {string} closeTime : Time the restaurant closes. Format is "HH:MM:SS""
 * @returns {Promise}: Returns the RestaurantHour object
 */
export function create(dayOfTheWeek, openTime, closeTime) {
  return models.RestaurantHour.create({dayOfTheWeek, openTime, closeTime});
}

/**
 * Finds restaurant hour given a restaurantName and dayOfTheWeek
 *
 * @param {string} restaurantName : name of the restaurant
 * @param {string} dayOfTheWeek : day of the week
 * @returns {Promise}: Returns the RestaurantHour object
 */
export function findOne(restaurantName, dayOfTheWeek) {
  return models.RestaurantHour.findOne(
    {where: {restaurantName, dayOfTheWeek}}
  );
}
