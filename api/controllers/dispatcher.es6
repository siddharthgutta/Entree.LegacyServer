import Emitter, {Events} from '../events/index.es6';
import {DefaultChatBot, chatStates} from '../../libs/chat-bot/index.es6';
import {sendSMS} from './sms.es6';
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
Emitter.on(Events.USER_PAYMENT_REGISTERED, async ({id: userId}) => {
  const user = await User.UserModel.findOne(userId);

  try {
    const chatState = await user.findChatState();
    const order = await chatState.findOrderContext();

    if (order) {
      const {id: orderId} = order;
      const {id: restaurantId} = await Order.getRestaurantFromOrder(orderId);
      const {token} = await Payment.getCustomerDefaultPayment(userId);
      const price = await Order.getOrderTotalById(orderId);

      try {
        const {id: transactionId} = await Payment.paymentWithToken(userId, restaurantId, token, price); // eslint-disable-line
        await Order.setOrderStatus(orderId, Order.Status.RECEIVED_PAYMENT, {transactionId});
      } catch (e) {
        const err = new TraceError(`Payment failed; user(${userId}) -> restaurant(${restaurantId})`, e);
        console.tag('dispatcher', 'USER_PAYMENT_REGISTERED').error(err);
        // TODO send the request link again
        sendSMS(user.phoneNumber, `There was a problem with your credit card: ${e.message}`); // FIXME temp
      }
    }
  } catch (e) {
    const err = new TraceError(`Could not process order`, e);
    console.tag('dispatcher', 'USER_PAYMENT_REGISTERED').error(err);
    sendSMS(user.phoneNumber, 'There was a problem locating your last order. Can you please try again?');
  }
});

Emitter.on(Events.UPDATED_ORDER, async order => {
  // TODO @jesse move this to chatbot
  const message = {
    [Order.Status.RECEIVED_PAYMENT]: `Your order just got sent. Hang tight!`,
    [Order.Status.ACCEPTED]: `Your order just got accepted :). It will be ready in ${order.prepTime} mins`,
    [Order.Status.DECLINED]: `Your order just got declined :(. ${order.message}`,
    [Order.Status.COMPLETED]: `Your order is ready!`
  };

  if (order.status === Order.Status.ACCEPTED) {
    const user = await order.findUser();
    const chatState = await user.findChatState();

    await chatState.clearOrderItems();
    await chatState.clearRestaurantContext();
    await chatState.updateState(chatStates.start);
  }

  if (order.status === Order.Status.COMPLETED) {
    const user = await order.findUser();
    const chatState = await user.findChatState();

    await chatState.clearOrderContext();
  }

  const text = message[order.status];

  if (text) {
    await sendSMS(order.User.phoneNumber, text);
  }
});
