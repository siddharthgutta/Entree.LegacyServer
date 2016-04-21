import * as Order from '../order.es6';
import * as Notification from './notification.es6';
import {isEmpty} from '../../libs/utils.es6';
import Emitter, {Events} from '../events/index.es6';
import {Status} from '../order.es6';

export {Status};

const restaurantStatuses = [Status.ACCEPTED, Status.DECLINED, Status.COMPLETED, Status.READY];

export async function setOrderStatus(id, status, {prepTime, message, transactionId} = {}, isRestaurant = false) {
  const order = await Order.findOne(id);
  const {RestaurantId: restaurantId} = order;

  let notificationEvent;
  let internalEvent;

  console.tag('controller', 'order').log({id, status, prepTime, message, isRestaurant});

  if (isRestaurant && !restaurantStatuses.includes(status)) {
    throw Error('Invalid operations for a restaurant');
  }

  if (status === Status.ACCEPTED) {
    if (!(prepTime > 0)) { // typecheck performed at model level
      throw Error('Preparation time is required for accepting an order!');
    }
  } else {
    prepTime = null;
  }

  if (status === Status.DECLINED) {
    if (isEmpty(message)) {
      throw Error('Message is required for accepting an order!');
    }
  } else {
    message = null;
  }

  if (status === Status.RECEIVED_PAYMENT) {
    if (isEmpty(transactionId)) {
      throw Error('TransactionID is required for received payment!');
    }
  } else {
    transactionId = null;
  }

  switch (status) {
    case Status.RECEIVED_PAYMENT:
      notificationEvent = Notification.Events.NEW_ORDER;
      internalEvent = Events.UPDATED_ORDER;
      break;
    case Status.ACCEPTED:
    case Status.READY:
    case Status.COMPLETED:
    case Status.DECLINED:
      notificationEvent = Notification.Events.ORDER_UPDATE;
      internalEvent = Events.UPDATED_ORDER;
      break;
    case Status.FAILED_PAYMENT:
      break;
    default: // ignore
  }

  try {
    const _order = await Order.findOneAndUpdateStatus(id, status, {prepTime, message, transactionId});

    if (internalEvent) {
      Emitter.emit(internalEvent, _order, order, restaurantId);
    }

    if (notificationEvent) {
      Notification.notify(restaurantId, notificationEvent, _order);
    }

    return _order;
  } catch (e) {
    throw new TraceError('Could not update restaurant; possibly wrong state?', e);
  }
}

export async function createOrder(userId, restaurantId, items) {
  try {
    const order = await Order.safelyCreate(userId, restaurantId, items);

    // global event
    Emitter.emit(Events.ORDER_PLACED, order);

    return order;
  } catch (e) {
    throw new TraceError('Could not create a new order', e);
  }
}

export async function getOrders(restaurantId) {
  try {
    return (await Order.findByRestaurant(restaurantId));
  } catch (e) {
    throw new TraceError(`Could not find orders for ${restaurantId}`, e);
  }
}

export async function getOrder(orderId) {
  try {
    return (await Order.findOne(orderId));
  } catch (e) {
    throw new TraceError(`Could not find order for ${orderId}`, e);
  }
}

export async function getOrderTotalById(orderId) {
  try {
    return await Order.calculateTotal(orderId);
  } catch (e) {
    throw new TraceError('Could not calculate total', e);
  }
}

export async function getRestaurantFromOrder(orderId) {
  try {
    return await Order.findParentRestaurant(orderId);
  } catch (e) {
    throw new TraceError('Could not find parent restaurant', e);
  }
}

export async function getUserFromOrder(orderId) {
  try {
    return await Order.findUser(orderId);
  } catch (e) {
    throw new TraceError('Could not find parent restaurant', e);
  }
}

/**
 * Expose model
 */
export {Order as OrderModel};
