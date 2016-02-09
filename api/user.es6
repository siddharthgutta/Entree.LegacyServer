import models from '../models/mysql/index.es6';
import db from '../models/mysql/index.es6';
import {sendSMS} from './sms.es6';


/**
 * IMPORTANT: Must return promises!
 */

/**
 * Create a user
 *
 * @param {string} phoneNumber: User phone number
 * @param {string} name: User name
 * @param {string} email: User email
 * @returns {Promise}: Returns the user object
 */
export function create(phoneNumber, name, email) {
  return models.User.create({phoneNumber, name, email});
}

/**
 * Gets the greeting message to be sent on signup, can return signup or greeting message
 *
 * @param {string} name: User's name
 * @param {boolean} firstTime: whether or not this is the first time signing up
 * @returns {string}: Returns greeting message
 */
function getGreeting(name, firstTime) {
  if (firstTime && name) {
    return `Hi ${name}, Entrée here. I can help you order ahead at your favorite restaurants. ' +
      'Type in /r to see where I work. Type in /help at any point if you need help.`;
  } else if (firstTime && !name) {
    return 'Hi, Entrée here. I can help you order ahead at your favorite restaurants. ' +
      'Type in /r to see where I work. Type in /help at any point if you need help.';
  } else if (!firstTime && name) {
    return `Welcome back ${name}! I'm here to help you order ahead at your favorite restaurants. ` +
      'Type in /r to see where I work. Type in /help at any point if you need help.';
  }
  return "Welcome back! I'm here to help you order ahead at your favorite restaurants. " +
    'Type in /r to see where I work. Type in /help at any point if you need help.';
}

/**
 * Initial User Signup
 * Create user with just a phone number
 *
 * @param {string} phoneNumber: User phone number
 * @returns {Promise}: Returns the user object.
 */
export function signup(phoneNumber) {
  return new Promise((resolve, reject) => {
    db.sequelize.transaction(t =>
      models.User.findOrCreate({where: {phoneNumber}, transaction: t})
        .spread((user, created) => {
          sendSMS(user.phoneNumber, getGreeting(user.name, created))
            .then(response => {
              // sendSMS will pass the response from twilio with text sent details
              // this response is not currently being dealt with but needs to be stored in the Messages table
              console.tag('routes', 'api', '/user/signup', 'User.signup', 'SUCCESS')
                .log(`New user was ${created ? 'created' : 'found'} & ` +
                  `${created ? 'full' : 'partial'} welcome message.`);
              return resolve(response);
            }).catch(error => {
              console.tag('api', 'user', 'signup', 'sendSMS', 'ERROR')
                .log('Text Message was not sent successfully, but user account was created.' +
                  `If user account was created, rolling it back now. SMS Error:`, error);
              throw new Error(`SMS Error: ${JSON.stringify(error)}`);
            });
        }).catch(error => {
          console.tag('api', 'user', 'signup', 'sendSMS', 'ERROR')
            .log(`User could not be created/found in the User table. No text message sent to user. Error: ${error}`);
          return reject(error);
        })
    );
  });
}

/**
 * Update a user attributes
 *
 * @param {string} phoneNumber: User phone number
 * @param {Object} attributes: Attributes to update
 * @returns {Promise}: Returns the user object
 */
export function update(phoneNumber, attributes) {
  return models.User.update(
      attributes, {
        where: {phoneNumber}
      }
  );
}

/**
 * Destroy a user
 *
 * @param {string} phoneNumber: User phone number
 * @returns {Promise}: Returns the user object
 */
export function destroy(phoneNumber) {
  return models.User.destroy({
    where: {phoneNumber}
  });
}

/**
 * Find a user by phone
 *
 * @param {string} phoneNumber: User phone number
 * @returns {Promise}: Returns the user object
 */
export function findOne(phoneNumber) {
  return models.User.findOne({
    where: {phoneNumber}
  });
}
