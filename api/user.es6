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
 * @param {string} password: User password
 * @param {string} name: User name
 * @param {string} email: User email
 * @returns {Promise}: Returns the user object
 */
export function create(phoneNumber, password, name, email) {
  return models.User.create({phoneNumber, password, name, email});
}

const signupGreeting = 'Hi, Entrée here. I can help you order ahead at your favorite restaurants. ' +
  'Type in /r to see where I work. Type in /help at any point if you need help.';

/**
 * Initial User Signup
 * Create user with just a phone number
 *
 * @param {string} phoneNumber: User phone number
 * @returns {Promise}: Returns the user object.
 */
export function signup(phoneNumber) {
  return db.sequelize.transaction(t =>
    models.User.create({phoneNumber}, {transaction: t})
      .then(() => {
        sendSMS(phoneNumber, signupGreeting)
          .catch(error => {
            console.tag('api', 'user', 'signup', 'sendSMS', 'ERROR')
              .log(`Text Message was not sent successfully, but user account was created. SMS Error: ${error}`);
            throw new Error(`SMS failed to send correctly.`);
          });
      }).catch(() => {
        console.tag('api', 'user', 'signup', 'sendSMS', 'ERROR')
          .log('User account could not be created in the User table. No text message sent to user.');
        throw new Error(`User account failed to be created.`);
      })
  );
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
