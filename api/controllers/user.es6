import * as User from '../user.es6';
import {sendSMS} from './sms.es6';
import {format} from 'url';
import config from 'config';
import Runtime from '../../libs/runtime.es6';

// FIXME @jesse: why are the raw db connections used here?
const {User: _User, sequelize: Sequelize} = User.connection;

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
    return 'Entrée helps you order ahead and cut the line at the best food trucks around you. ' +
      'We are currently in closed beta but will notify you as soon as we launch!';
  } else if (!firstTime && name) {
    return `Welcome back ${name}! I'm here to help you order ahead at your favorite restaurants. ` +
      'Type in /r to see where I work. Type in /help at any point if you need help.';
  }
  return 'Entrée helps you order ahead and cut the line at the best food trucks around you. ' +
    'We are currently in closed beta but will notify you as soon as we launch!';
}

/**
 * Initial User Signup
 * Create user with just a phone number
 *
 * @param {string} phoneNumber: User phone number
 * @returns {Promise}: Returns the user object.
 */
export function signup(phoneNumber) {
  return new Promise((outerResolve, outerReject) => {
    Sequelize.transaction(t =>
                            new Promise((resolve, reject) => {
                              _User.findOrCreate({where: {phoneNumber}, transaction: t})
                                   .spread((user, created) => {
                                     sendSMS(user.phoneNumber, getGreeting(user.name, created))
                                     .then(response => {
                                       // sendSMS will pass the response from twilio with text sent details
                                       // this response is not currently being dealt with but needs to be stored
                                       // in the Messages table
                                       console.tag('routes', 'api', '/user/signup', 'User.signup')
                                              .log(`New user was ${created ? 'created' : 'found'} & ` +
                                                   `${created ? 'full' : 'partial'} welcome message.`);
                                       resolve(response);
                                     })
                                     .catch(error => {
                                       console.tag('api', 'user', 'signup', 'sendSMS')
                                              .error('Text Message not sent successfully, but user account was ' +
                                                     'created.' +
                                                     `User account was ${created ? 'created. Rolling it back now.'
                                                       : 'not created.'} SMS Error:`, error);
                                       reject(error);
                                     });
                                   })
                                   .catch(error => {
                                     console.tag('api', 'user', 'signup', 'sendSMS')
                                            .error(`User not created/found in the User table. No text message sent
                                           to user. Error: ${error}`);
                                     reject(error);
                                   });
                            })
             )
             .then(result => {
               outerResolve(result);
             })
             .catch(err => {
               outerReject(err);
             });
  });
}

export async function resolveProfileEditAddress(secret) {
  const address = config.get('Server');

  address.hostname = await Runtime.hostname();
  address.path = `/api/v2/user/profile/${secret}`; // TODO idk how to not make this a constant

  return format(address);
}

export async function requestProfileEdit(userId) {
  return User.createSecret(userId);
}

export async function requestProfileEditByPhoneNumber(phoneNumber) {
  const {id: userId} = await User.findOneByPhoneNumber(phoneNumber);
  return requestProfileEdit(userId);
}

export async function getUserProfile(secret) {
  if (!secret) {
    throw Error('Invalid secret');
  }

  try {
    const user = await User.findBySecret(secret); // TODO add payment information
    return user.get(); // return the raw object
  } catch (e) {
    throw new TraceError(`User cannot be found - ${secret}`, e);
  }
}

export async function updateUserProfile(secret, {name, email} = {}) {
  const {phoneNumber, ...other} = await User.findBySecret(secret);
  const updateAttrs = Object.assign(other, {name, email});
  await User.updateByPhoneNumber(phoneNumber, updateAttrs);
  const user = await User.findOneByPhoneNumber(phoneNumber);
  return user.get();
}

export {User as UserModel};
