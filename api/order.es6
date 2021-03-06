import models from '../models/mysql/index.es6';
import {Status} from '../models/mysql/order.es6';
import Promise from 'bluebird';
import {stripUndefNull} from '../libs/utils.es6';
import _ from 'underscore';

export {Status};

// TODO move to controllers/restaurant
export async function findByRestaurant(restaurantId, statuses = []) {
  const {Restaurant, Order} = models;
  const statusQuery = {};

  if (statuses.length) {
    statusQuery.where = {status: {$in: statuses}};
  }

  try {
    const query = {
      where: {id: restaurantId},
      include: [{required: false, model: Order, ...statusQuery, include: [{all: true}]}]
    };
    const restaurant = (await Restaurant.findOne(query, {logging: true})).toJSON();
    return restaurant.Orders || [];
  } catch (e) {
    throw new TraceError(`Could not find order by restaurant: ${restaurantId}`, e);
  }
}

export async function findOne(id, statuses = []) {
  const {Order} = models;
  let statusQuery = {};

  if (statuses.length) {
    statusQuery = {status: {$in: statuses}};
  }

  try {
    return (await Order.findOne({where: {id, ...statusQuery}, include: [{all: true}]})).toJSON();
  } catch (e) {
    throw new TraceError(`Could not find order by id: ${id}`, e);
  }
}

export const OrderStatusStates = {
  [Status.PENDING_PAYMENT]: [Status.FAILED_PAYMENT, Status.RECEIVED_PAYMENT],
  [Status.FAILED_PAYMENT]: [Status.RECEIVED_PAYMENT],
  [Status.RECEIVED_PAYMENT]: [Status.ACCEPTED, Status.DECLINED],
  [Status.COMPLETED]: [],
  [Status.READY]: [Status.COMPLETED],
  [Status.ACCEPTED]: [Status.READY],
  [Status.DECLINED]: []
};

export async function safelyCreate(userId, restaurantId, items) {
  const {Restaurant, Order, Item, User, transact, sequelize} = models;

  const order = await transact(async transaction => {
    const user = await User.findOne({where: {id: userId}}, {transaction});
    const query = {where: {id: restaurantId, enabled: true, deleted: false}};
    const restaurant = await Restaurant.findOne(query, {transaction});
    const _items = await Promise.map(items, item => Item.create(item, {transaction})); // TODO extract fields
    const orderQuery = {userId, restaurantId, status: Status.PENDING_PAYMENT, id2: restaurant.get('orderCounter')};
    const _order = await Order.create(orderQuery, {transaction});
    await _order.addItems(_items, {transaction});
    await restaurant.addOrder(_order, {transaction});
    await user.addOrder(_order, {transaction});
    await restaurant.update({orderCounter: sequelize.literal('orderCounter + 1')}, {transaction});
    return _order;
  });

  return await findOne(order.id);
}

export async function findOneAndUpdateStatus(id, status, {prepTime, message, transactionId}) {
  const {Order} = models;

  // ensure the reverse
  const previousStatus = _.compact(_.map(OrderStatusStates, (v, k) => v.includes(status) ? k : null));

  // ensure anything that is set does not get set back to NULL
  const attributes = {status, ...stripUndefNull({prepTime, message, transactionId})};

  console.tag('api', 'orders').log({attributes, previousStatus, status, id});

  try {
    const [affectedRows] = await Order.update(attributes, {where: {id, status: {$in: previousStatus}}, logging: true});
    if (!affectedRows) {
      throw new Error('Order state not in valid state');
    }
  } catch (e) {
    throw new TraceError('Could not update order status', e);
  }

  return await findOne(id);
}

export async function findParentRestaurant(id) {
  const {Order} = models;
  const order = await Order.findOne({where: {id}});

  if (!order) {
    throw Error(`Could not find order by id(${id}) hence no parent restaurant`);
  }

  return (await order.getRestaurant()).toJSON();
}

export async function findUser(id) {
  const {Order} = models;
  const order = await Order.findOne({where: {id}});

  if (!order) {
    throw Error(`Could not find order by id(${id}) hence no user`);
  }

  return (await order.getUser()).toJSON();
}

export async function findItems(id) {
  const {Order} = models;
  const order = await Order.findOne({where: {id}});

  const items = await order.getItems();
  _.each(items, item => item.toJSON());

  return items;
}

export async function calculateTotal(id) {
  const {Order} = models;
  const order = await Order.findOne({where: {id}});

  if (!order) {
    throw Error(`Could not find order by id(${id})`);
  }

  return _.reduce(await order.getItems(), (memo, item) => memo + item.price, 0);
}
