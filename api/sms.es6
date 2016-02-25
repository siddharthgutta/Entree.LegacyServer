import Twilio from '../libs/sms/twilio.es6';
import config from 'config';
import _ from 'underscore';
import Promise from 'bluebird';

const admins = config.get('Admins');
const fromNumber = config.get('Twilio.numbers')[0];
const productionCreds = config.get('Twilio.production');

/**
 * SMS strategy
 * @type {Twilio}
 */
const productionSMS = new Twilio(fromNumber, productionCreds.sid, productionCreds.authToken);

/**
 * Send a custom message
 * @param {string} toNumber: number SMS message will be sent to
 * @param {string} textBody: message to be sent
 * @returns {Promise} error or response for sending message
 */
export function sendSMS(toNumber, textBody) {
  console.tag('api', 'sms', 'production')
         .log(toNumber, textBody);
  return productionSMS.send(toNumber, textBody);
}

/**
 * Send a data to multiple users; defaults to admins
 * @param {string} textBody: message to be sent
 * @param {Object[]} to: list of phone numbers and names to send message to
 * @returns {Promise[]} list of errors and responses for each sent message
 */
export function broadcast(textBody, to = admins) {
  return Promise.all(_.map(to, ({phone, name}) => sendSMS(phone, `Server Notification for ${name}: ${textBody}`)));
}
