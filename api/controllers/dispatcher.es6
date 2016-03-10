import Emitter, {Events} from '../events/index.es6';
import {DefaultChatBot} from '../../libs/chat-bot/index.es6';
import {sendSMS} from './sms.es6';
import * as Order from './order.es6';
import * as Restaurant from './restaurant.es6';
import * as User from './user.es6';
import Chance from 'chance';

const chance = new Chance();
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
    if (typeof response === 'object') {
      const items = response.order.items.map(item => {
        item.price = chance.floating({min: 0, max: 10, fixed: 2});
        return item;
      });

      const user = await User.UserModel.findOneByPhoneNumber(text.from);
      const restaurant = await Restaurant.RestaurantModel.findByName(response.restaurant);
      const order = await Order.createOrder(user.id, restaurant.id, items);

      setTimeout(() => {
        Order.setOrderStatus(order.id, Order.Status.RECEIVED_PAYMENT);
      }, 5000);

      await sendSMS(text.from, response.response);
    } else if (response) {
      await sendSMS(text.from, response);
    } else {
      throw Error('Not passing in a text?');
    }
  } catch (err) {
    console.error(err);

    /* Best way to handle errors? */
    await sendSMS(text.from, 'Something went wrong');
  }
});

/**
 * Make an order if a process is done
 */
Emitter.on(Events.USER_PAYMENT_REGISTERED, async user => {
  console.log(user);
  // TODO @jadesym: payment module emits the global event once payment for a user is confirmed
  // TODO @jesse: check if user associated with payment has any orders; send texts accordingly
  // TODO         then, create order via. Order.create function
  // TODO @jadesym: process payment for order; Order.getCost() function coming soon
  // TODO @jadesym: once payment goes through set Order.setStatus(Order.Status.<SELECT_ONE>)
});

Emitter.on(Events.UPDATED_ORDER, async order => {
  // TODO @jesse move this to chatbot
  const message = {
    [Order.Status.RECEIVED_PAYMENT]: `Hey, your order just got sent. Hang tight!`,
    [Order.Status.ACCEPTED]: `Hey, your order just got accepted :). It will be ready in ${order.prepTime} mins`,
    [Order.Status.DECLINED]: `Hey, your order just got declined :(. ${order.message}`,
    [Order.Status.COMPLETED]: `Hey, your order is ready!`
  };

  const text = message[order.status];

  if (text) {
    await sendSMS(order.User.phoneNumber, text);
  }
});
