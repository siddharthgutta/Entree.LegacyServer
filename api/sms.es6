import Twilio from '../libs/sms/twilio.es6'
import config from 'config'
import _ from 'underscore';
import Promise from 'bluebird'

const admins = config.get('Admins');
const fromNumber = config.get('Twilio.fromNumbers');
const productionCreds = config.get('Twilio.production');

/**
 * SMS strategy
 * @type {Twilio}
 */
const productionSMS = new Twilio(fromNumber, productionCreds.sid, productionCreds.authToken);
/**
 * Send a custom message
 * @param to
 * @param data
 * @returns {*}
 */
export function sendSMS(toNumber, textBody) {
  console.tag('api', 'sms', 'production').log(toNumber, textBody);
  return productionSMS.send(toNumber, textBody);
}

/**
 * Send a data to multiple users; defaults to admins
 * @param data
 * @param to
 * @returns {Promise}
 */
export function broadcast(textBody, to=admins) {
  return Promise.all(_.map(to, ({phone, name}) => {
    var fullMessage = 'Server Notification for ' + name + ': ' + textBody;
    sendSMS(phone, fullMessage)
  }));
}