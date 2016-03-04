import {Twilio, TwilioRemote} from '../../libs/sms/index.es6';
import {RemoteSocketServer} from '../../libs/socket-server/index.es6';
import config from 'config';
import Promise from 'bluebird';
import {SocketServer} from './notification.es6';
import * as Message from './../message.es6';
import * as Notification from './notification.es6';
import Emitter, {Events} from '../events/index.es6';

const admins = config.get('Admins');
const forceLocalStrategy = false;

/**
 * Purpose of this API is to handle everything SMS. All incoming and sent
 * texts will be going through this.
 */

/**
 * Select the strategy
 */
let sms;
if (!forceLocalStrategy && SocketServer instanceof RemoteSocketServer) {
  sms = new TwilioRemote(SocketServer);

  const devNumber = config.get('DeveloperNumber');
  console.tag('api', 'sms').info('using TwilioRemote; accepting only', devNumber);
} else {
  const fromNumber = config.get('Twilio.numbers')[0];
  const productionCreds = config.get('Twilio.production');

  sms = new Twilio(fromNumber, productionCreds.sid, productionCreds.authToken);

  console.tag('api', 'sms').info('using Twilio', fromNumber);
}

/**
 * Strip the country code of number; US only
 * @param {String} number: number as string
 * @returns {String} cleaned number
 */
function stripCountryCode(number) {
  return number.substr(-10);
}

/**
 * Handle the texts that are sent to the server
 * @param {SMSData} text: text to be handled
 * @returns {null} void
 */
async function processReceive(text) {
  console.tag('api', 'sms', 'processReceive').log('Processing text', text.id, text);

  text.to = stripCountryCode(text.to);
  text.from = stripCountryCode(text.from);

  const {id, from: phoneNumber, to: twilioNumber, body: content, date, status} = text;
  const sentByUser = true;
  const success = !!status;

  try {
    // TODO Core logic here, we can extract to a core engine class
    // TODO @jesse restaurant number before processing it?
    // we need to store messages for sure
    // if message.create fails, we know that another instance
    await Message.create(phoneNumber, 0, content, date, id, twilioNumber, sentByUser, success);

    Emitter.emit(Events.TEXT_RECEIVED, text);

    // only notify the gods since restaurants are disabled
    await Notification.notifyGods(Notification.Events.TEXT_RECEIVED, {phoneNumber, content, date, sentByUser});
  } catch (e) {
    return console.tag('api', 'sms', 'processReceive').error(e);
  }
}

/**
 * Handle all the texts that are sent by the server
 * @param {SMSData} text: text to be handled
 * @returns {null} void
 */
async function processSent(text) {
  console.tag('api', 'sms', 'processSent').log('Processing text', text.id, text);

  text.to = stripCountryCode(text.to);
  text.from = stripCountryCode(text.from);

  const {id, from: twilioNumber, to: phoneNumber, body: content, date, status} = text;
  const sentByUser = false;
  const success = !!status;

  try {
    await Message.create(phoneNumber, 0, content, date, id, twilioNumber, sentByUser, success);

    // only notify the gods since restaurants are disabled
    await Notification.notifyGods(Notification.Events.TEXT_SENT, {phoneNumber, content, date, sentByUser});
  } catch (e) {
    return console.tag('api', 'sms', 'processSent').error(e);
  }
}

/**
 * SMS receive handler found in the base class of SMS
 */
sms.on(Twilio.RECEIVED, async text => {
  if (sms instanceof TwilioRemote) {
    // TODO export DEVELOPER_NUMBER=+1<your_number>
    // put that into .bashrc or .bash_profile
    if (text.from !== config.get('DeveloperNumber')) {
      console.tag('api', 'sms', 'ignored-text', {text});
      return;
    }
  }

  processReceive(text);
});

/**
 * Send a custom message
 * @param {string} toNumber: number SMS message will be sent to
 * @param {string} textBody: message to be sent
 * @returns {Promise} error or response for sending message
 */
export async function sendSMS(toNumber, textBody) {
  console.tag('api', 'sms', 'sendSMS').log(toNumber, textBody);

  if (!toNumber) {
    throw new Error('Invalid toNumber');
  }

  if (!textBody) {
    throw new Error('Invalid textBody');
  }

  try {
    const text = await sms.send(toNumber, textBody);
    await processSent(text);
    return text;
  } catch (e) {
    console.tag('api', 'sms', 'sendSMS').error(e);

    throw e;
  }
}

/**
 * Send a data to multiple users; defaults to admins
 * @param {string} textBody: message to be sent
 * @param {Object[]} to: list of phone numbers and names to send message to
 * @returns {Promise[]} list of errors and responses for each sent message
 */
export function broadcast(textBody, to = admins) {
  return Promise.map(to, ({phone, name}) => sendSMS(phone, `Server Notification for ${name}: ${textBody}`));
}

/**
 * SMS strategy
 * @type {SMS}
 */
export const SMS = sms;


/**
 * Expose model
 */
export {Message as MessageModel};
