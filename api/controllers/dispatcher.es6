import Emitter, {Events} from '../events/index.es6';
import {DefaultChatBot, chatStates} from '../../libs/chat-bot/index.es6';
import {sendSMS} from './sms.es6';
import {resolve} from '../../models/index.es6';
import * as Order from './order.es6';
import * as User from './user.es6';
import * as Payment from '../payment.es6';

const chatBot = new DefaultChatBot();

/**
 * Dispatcher to handle system events
 */

/**
 * Handle the texts that are sent to the server
 * @param {SMSData} text: text to be handled
 * @returns {null} void
 */
Emitter.on(Events.TEXT_RECEIVED, async text => {
  console.tag('api', 'sms', 'processReceive').log('Processing text', text.id, text);

  try {
    const response = await chatBot.updateState(text.from, text.body);

    /* TODO @Jadesym - move into chatbot. Only reason response is null is if the user isn't signed up*/
    if (response) {
      await sendSMS(text.from, response);
    }
  } catch (err) {
    console.tag('dispatcher', 'TEXT_RECEIVED').error(err);

    /* Best way to handle errors? */
    await sendSMS(text.from, 'Sorry, we had problem on our side. If you are still having problems, contact us at' +
                  ' team@textentree.com');
  }
});

/**
 * Make an order if a process is done
 */
Emitter.on(Events.USER_PAYMENT_REGISTERED, async({id: userId}) => {
  const user = await User.UserModel.findOne(userId);

  let chatState, defaultPayment, restaurantId, orderId, totalPrice; // eslint-disable-line
  try {
    chatState = await user.findChatState();
    const orderItems = await chatState.findOrderItems();
    const restaurant = await chatState.findRestaurantContext();
    const items = orderItems.map(({name, price}) => ({name, price, quantity: 1}));

    restaurantId = restaurant.id;

    const order = await Order.createOrder(userId, restaurantId, items);
    await chatState.setOrderContext(order.resolve());

    orderId = order.id;
    defaultPayment = await Payment.getCustomerDefaultPayment(userId);
    totalPrice = await Order.getOrderTotalById(orderId);
  } catch (e) {
    const err = new TraceError(`Could not process order`, e);
    console.tag('dispatcher', 'USER_PAYMENT_REGISTERED').error(err);
    sendSMS(user.phoneNumber, 'There was a problem processing your last order. Can you please try again?');

    throw err;
  }

  let payment;
  try {
    payment = await Payment.paymentWithToken(userId, restaurantId, defaultPayment.token, totalPrice);
  } catch (e) {
    const err = new TraceError(`Payment failed; user(${userId}) -> restaurant(${restaurantId})`, e);
    console.tag('dispatcher', 'USER_PAYMENT_REGISTERED').error(err);
    const secret = await User.requestProfileEdit(userId);
    const profileUrl = await User.getUserProfile(secret);
    sendSMS(user.phoneNumber, `There was a problem with your ${defaultPayment.cardType} credit card ending in` +
      ` ${defaultPayment.last4}. Please update your payment information at ${profileUrl}`);

    throw err;
  }

  try {
    await chatState.clearOrderItems();
    await chatState.updateState(chatStates.start);

    await Order.setOrderStatus(orderId, Order.Status.RECEIVED_PAYMENT, {transactionId: payment.id});
    sendSMS(user.phoneNumber, `Your order using ${defaultPayment.cardType} ending in ${defaultPayment.last4} ` +
      `has been sent to the restaurant. We'll text you once it's confirmed by the restaurant`);
  } catch (e) {
    const err = new TraceError(`Could not process order`, e);
    console.tag('dispatcher', 'USER_PAYMENT_REGISTERED').error(err);
    sendSMS(user.phoneNumber, 'There was a problem processing your last order. Can you please try again?');

    throw err;
  }
});

Emitter.on(Events.UPDATED_ORDER, async order => {
  const restaurant = await Order.getRestaurantFromOrder(order.id);

  // TODO @jesse move this to chatbot
  const message = {
    [Order.Status.ACCEPTED]: `Your order shown below has been placed :) It will be ready in ${order.prepTime} mins`,
    [Order.Status.DECLINED]: `Your order just got declined :( ${order.message}.`,
    [Order.Status.COMPLETED]: `Your ${restaurant.name} order is ready to be picked up!` +
  ` Please present your name and order number (#${order.id2}) when you arrive.`
  };

  let response = message[order.status];
  const user = resolve(await Order.getUserFromOrder(order.id));
  const chatState = await user.findChatState();

  switch (order.status) {
    case Order.Status.ACCEPTED:
      const items = await Order.OrderModel.findItems(order.id);
      const defaultPayment = await Payment.getCustomerDefaultPayment(user.id);

      let itemFormat = '';
      let total = 0;

      response += `\n\nOrder #${order.id2} Receipt:`;

      for (let i = 0; i < items.length; i++) {
        itemFormat += `${i + 1}) ${items[i].name} - $${(items[i].price / 100).toFixed(2)}\n`;
        total += items[i].price;
      }

      response += `\n\n${itemFormat}\nA total of $${(total / 100).toFixed(2)} was charged with` +
        ` ${defaultPayment.cardType} ending in ${defaultPayment.last4}`;

      await chatState.updateState(chatStates.start);
      break;
    case Order.Status.DECLINED:
      await chatState.clearOrderContext();
      await chatState.updateState(chatStates.start);
      break;
    case Order.Status.COMPLETED:
      await chatState.clearOrderContext();
      break;
    default:
  }

  if (response) {
    await sendSMS(user.phoneNumber, response);
  } else {
    throw Error(`UPDATED_ORDER text response for user ${user.id} is null`);
  }
});
