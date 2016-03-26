import Sequelize from 'sequelize';

/**
 * Access ORM instance associated with any given object. This function is considered
 * be unsafe and should not be used out of any model related code since the internal structure
 * can change. In general, it is recommended to consult with the model owner before this
 * function is invoked and the ORM instance is modified
 *
 * Usage:
 *
 *    // restaurant is a serialized object which has no ORM bindings
 *    const restaurant = await Restaurant.findOne(3434);
 *    const orders = restaurant.getOrders(); // throws an error because the ORM function does not exist
 *
 *    // restaurant object now has the ORM bindings
 *    const ormRestaurant = resolve(restaurant);
 *    const ormOrders = ormRestaurant.getOrders(); // valid ORM function
 *
 *    assert(ormRestaurant === resolve(ormRestaurant))
 *
 * @param {Object} instance: any object
 * @returns {Object} the ORM instance
 * @throws an error if no ORM instance can be found
 */
export function resolve(instance) {
  try {
    return Sequelize.resolve(instance);
  } catch (e) {
    // Mongoose.resolve(a);
  }
}
