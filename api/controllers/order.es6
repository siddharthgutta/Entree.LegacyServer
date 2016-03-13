import * as Order from '../order.es6';
import * as Notification from './notification.es6';
import Emitter, {Events} from '../events/index.es6';
import {Status} from '../order.es6';

export {Status};

const restaurantStatuses = [Status.ACCEPTED, Status.DECLINED, Status.COMPLETED];

export async function setOrderStatus(id, status, {prepTime, message, transactionId} = {}, isRestaurant = false) {
  const {RestaurantId: restaurantId} = await Order.findOne(id);
  let notificationEvent;
  let internalEvent;

  console.tag('controller', 'order').log({id, status, prepTime, message, isRestaurant});

  if (isRestaurant && !restaurantStatuses.includes(status)) {
    throw Error('Invalid operations for a restaurant');
  }

  if (status === Status.ACCEPTED) {
    if (!prepTime) {
      throw Error('Preparation time is required for accepting an order!');
    }
  } else {
    prepTime = null;
  }

  if (status === Status.DECLINED) {
    if (!message) {
      throw Error('Message is required for accepting an order!');
    }
  } else {
    message = null;
  }

  if (status === Status.RECEIVED_PAYMENT) {
    if (!transactionId) {
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

    if (notificationEvent) {
      Notification.notify(restaurantId, notificationEvent, _order);
    }

    if (internalEvent) {
      Emitter.emit(internalEvent, _order);
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

/**
 * Expose model
 */
export {Order as OrderModel};
