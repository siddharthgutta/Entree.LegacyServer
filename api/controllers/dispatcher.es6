/* eslint-disable */
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

  await sendSMS(text.from, `At 11AM tomorrow (4/11/2016), you can text to order ahead, pre-pay, and skip the line at` +
    ` Chick-Fil-A. We will text you as soon as you can place an order!`);
  return;

  /* try {
    const response = await chatBot.updateState(text.from, text.body);

    if (response) {
      await sendSMS(text.from, response);
    }
  } catch (err) {
    console.tag('dispatcher', 'TEXT_RECEIVED').error(err);

    await sendSMS(text.from, 'Sorry, we had problem on our side. If you are still having problems, contact us at' +
                  ' team@textentree.com');
  } */
});

/**
 * Make an order if a process is done
 */
Emitter.on(Events.USER_PAYMENT_REGISTERED, async({id: userId}) => {
  const user = await User.UserModel.findOne(userId);

  try {
    const chatState = await user.findChatState();
    const order = await chatState.findOrderContext();

    if (order) {
      const {id: orderId} = order;
      const {id: restaurantId} = await Order.getRestaurantFromOrder(orderId);
      const defaultPayment = await Payment.getCustomerDefaultPayment(userId);
      const price = await Order.getOrderTotalById(orderId);

      try {
        const {id: transactionId} =
          await Payment.paymentWithToken(userId, restaurantId, defaultPayment.token, price);
        await Order.setOrderStatus(orderId, Order.Status.RECEIVED_PAYMENT, {transactionId});
        sendSMS(user.phoneNumber, `Your order using ${defaultPayment.cardType} ending in ${defaultPayment.last4} ` +
                `has been sent to the restaurant. We'll text you once it's confirmed by the restaurant`);
      } catch (e) {
        const err = new TraceError(`Payment failed; user(${userId}) -> restaurant(${restaurantId})`, e);
        console.tag('dispatcher', 'USER_PAYMENT_REGISTERED').error(err);
        const secret = await User.requestProfileEdit(userId);
        const profileUrl = await User.getUserProfile(secret);

        // FIXME I am not sure what e.message will output @jadesym
        sendSMS(user.phoneNumber, `The order could not be processed. There was a problem with your` +
        ` credit card: ${e.message}. Please update your payment information at ${profileUrl}`);
      }
    }
  } catch (e) {
    const err = new TraceError(`Could not process order`, e);
    console.tag('dispatcher', 'USER_PAYMENT_REGISTERED').error(err);
    sendSMS(user.phoneNumber, 'There was a problem locating your last order. Can you please try again?');
  }
});

Emitter.on(Events.UPDATED_ORDER, async order => {
  const restaurant = await Order.getRestaurantFromOrder(order.id);

  // TODO @jesse move this to chatbot
  const message = {
    [Order.Status.ACCEPTED]: `Your order has been placed :) It will be ready in ${order.prepTime} mins`,
    [Order.Status.DECLINED]: `Your order just got declined :( ${order.message}`,
    [Order.Status.COMPLETED]: `Your ${restaurant.name} order is ready to be picked up!` +
      ` Please present your name and order number (#${order.id2}) when you arrive.`
  };

  let response = message[order.status];
  const user = resolve(await Order.getUserFromOrder(order.id));

  if (order.status === Order.Status.ACCEPTED) {
    response += `\n\nOrder #${order.id2} Receipt:`;
    const chatState = await user.findChatState();
    const orderItems = await chatState.findOrderItems();
    const defaultPayment = await Payment.getCustomerDefaultPayment(user.id);

    let itemFormat = '';
    let total = 0;

    for (let i = 0; i < orderItems.length; i++) {
      itemFormat += `${i + 1}) ${orderItems[i].name} - $${(orderItems[i].price / 100).toFixed(2)}\n`;
      total += orderItems[i].price;
    }

    response += `\n${itemFormat}\nA total of $${(total / 100).toFixed(2)} was charged with` +
     ` ${defaultPayment.cardType} ending in ${defaultPayment.last4}`;

    await chatState.clearOrderItems();
    await chatState.updateState(chatStates.start);
  }

  if (order.status === Order.Status.COMPLETED) {
    const chatState = await user.findChatState();
    await chatState.clearOrderContext();
  }

  if (response) {
    await sendSMS(user.phoneNumber, response);
  } else {
    throw Error(`UPDATED_ORDER text response for user ${user.id} is null`);
  }
});
