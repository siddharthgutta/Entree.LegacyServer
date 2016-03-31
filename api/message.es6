import models from '../models/mongo/index.es6';
import * as Restaraunt from './restaurant.es6';

/**
 * IMPORTANT: Must return promises!
 */

/**
 * Finds all messages by phoneNumber ordered by date
 *
 * @param {string} phoneNumber: phone number of the user
 * @param {Object} optional: optional query parameters
 * @returns {Promise}: Returns a list of all messages with associated phone number
 */
export function findByPhone(phoneNumber, optional = {}) {
  return models.Message.find({phoneNumber, ...optional})
               .sort({date: -1})
               .exec();
}


/**
 * Finds all messages by restaurantId
 *
 * @param {number} restaurantId: restaurantId to be searched
 * @param {Object} optional: optional query parameters
 * @returns {Promise}: Returns a list of all messages for restaurant
 */
export async function findByRestaurant(restaurantId, optional = {}) {
  let query;

  try {
    const {mode} = await Restaraunt.findOne(restaurantId);
    if (mode === Restaraunt.Mode.GOD) {
      query = models.Message.find({});
    }
  } catch (e) {
    // ignore
  }

  if (!query) {
    query = models.Message.find({restaurantId, ...optional});
  }

  return query.sort({date: -1})
              .exec();
}

/**
 * Creates a message
 *
 * @param {string} phoneNumber: phone number of the user
 * @param {number} restaurantId: foreign key of restaurant user communicated with. Null if not sent to restaurant
 * @param {string} content: content of the message
 * @param {number} date: Unix timestamp of message send date
 * @param {string} twilioSid: message id generated by twilio
 * @param {string} twilioNumber: twilio phone number
 * @param {boolean} sentByUser: true if user sent message, false if user received message
 * @param {boolean} success: was the message successfully sent or error
 * @returns {Promise}: Returns a list of all messages between numberA and numberB
 */
export function create(phoneNumber,
                       restaurantId,
                       content,
                       date,
                       twilioSid,
                       twilioNumber,
                       sentByUser,
                       success) {
  return (new models.Message({
    phoneNumber,
    restaurantId,
    content,
    date,
    twilioSid,
    twilioNumber,
    sentByUser,
    success
  })).save();
}