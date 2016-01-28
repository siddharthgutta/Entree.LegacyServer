import Twilio from '../libs/sms/Twilio.es6'
import config from 'config'
import _ from 'underscore';
import Promise from 'bluebird'

const admins = _.pluck(config.get('Admins'), 'number');
const from = config.get('Twilio.from');
const account = config.get('Twilio.account');
const auth = config.get('Twilio.auth');

/**
 * SMS strategy
 * @type {Twilio}
 */
const sms = new Twilio(from, account, auth);

/**
 * Send a custom message
 * @param to
 * @param data
 * @returns {*}
 */
export function send(to, data) {
  console.tag('api', 'sms').log(to, data);
  return sms.send(to, data);
}

/**
 * Send a data to multiple users; defaults to admins
 * @param data
 * @param to
 * @returns {Promise}
 */
export function broadcast(data, to = admins) {
  return Promise.all(_.map(to, num => send(num, data)));
}