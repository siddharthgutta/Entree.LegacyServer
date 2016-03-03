import models from '../models/mongo/index.es6';

export {Status} from '../models/mongo/order.es6';

const {Order} = models;

export function findByRestaurant(restaurantId) {
  return Order.find({restaurantId}).lean().exec();
}

export function findOne(id) {
  return Order.findOne({id}).lean().exec();
}

export function findOneAndUpdateStatus(id, status) {
  return Order.update({id}, {status}).lean().exec();
}
