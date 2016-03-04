import Emitter, {Events} from '../events/index.es6';

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
  // TODO @jesse @jadesym very similar to the process below
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
