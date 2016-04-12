import * as User from '../user.es6';
import {sendSMS} from './sms.es6';
import Emitter, {Events} from '../events/index.es6';
import {format} from 'url';
import config from 'config';
import {hostname} from '../../libs/runtime.es6';
import {chatStates} from '../../libs/chat-bot/index.es6';

/**
 * Gets the greeting message to be sent on signup, can return signup or greeting message
 *
 * @param {string} name: User's name
 * @param {boolean} firstTime: whether or not this is the first time signing up
 * @returns {string}: Returns greeting message
 */
function getGreeting(name, firstTime) {
  if (firstTime) {
    return `Hi, Entree here. I can help you order ahead, pre-pay, and skip the line at the best food trucks and` +
      ` restaurants around you! Type in \"/r\" to see where I work.`;
  }
  if (name) {
    return `Welcome back ${name}! I can help you order ahead, pre-pay, and skip the line at the best food trucks and` +
      ` restaurants around you! Type in \"/r\" to see where I work.`;
  }

  return `Welcome back! I can help you order ahead, pre-pay, and skip the line at the best food trucks and` +
    ` restaurants around you! Type in \"/r\" to see where I work.`;
}

/**
 * Initial User Signup
 * Create user with just a phone number
 *
 * @param {string} phoneNumber: User phone number
 * @param {string} overrideGreeting: String override greeting
 * @param {boolean} noText: Indicates if we should send a signup text or not
 * @returns {Promise}: Returns the user object.
 */
export function signup(phoneNumber, overrideGreeting, noText) {
  // FIXME @jesse: why are the raw db connections used here?
  const {User: _User, sequelize: Sequelize} = User.connection;

  return new Promise((outerResolve, outerReject) => {
    Sequelize.transaction(t =>
                            new Promise((resolve, reject) => {
                              _User.findOrCreate({where: {phoneNumber}, transaction: t})
                                   .spread(async (user, created) => {
                                     let response;
                                     // TODO - fix after cfa
                                     if (!noText) {
                                       try {
                                         response = await sendSMS(
                                           user.phoneNumber,
                                           overrideGreeting || getGreeting(user.name, created));
                                         // sendSMS will pass the response from twilio with text sent details
                                         // this response is not currently being dealt with but needs to be stored
                                         // in the Messages table
                                         console.tag('controller', 'signup')
                                                .log(`New user was ${created ? 'created' : 'found'} & ` +
                                                     `${created ? 'full' : 'partial'} welcome message.`);
                                         // TODO @jadesym @jesse move getGreeting into chatbot. then ask chatbot
                                         // what to say and send that to the client.
                                         // TODO @jadesym lets get this into async/await if you get some downtime
                                       } catch (error) {
                                         console.tag('controller', 'signup', 'sms')
                                                .error('Text Message not sent successfully, but user account was ' +
                                                       'created.' +
                                                       `User account was ${created ? 'created. Rolling it back now.'
                                                         : 'not created.'} SMS Error:`, error);
                                         throw new TraceError('Could not send message after creating user', error);
                                       }
                                     }

                                     try {
                                       if (created) {
                                         await user.insertChatState(chatStates.start, t);
                                       }
                                     } catch (err) {
                                       console.tag('api', 'user', 'signup', 'chatstate')
                                              .error(`Unable to create chat state for user. Error: ${err}`);
                                       reject(err);
                                     }

                                     return response;
                                   })
                                   .catch(error => {
                                     console.tag('controller', 'signup', 'sms')
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

  address.hostname = await hostname();
  address.pathname = `profile`; // TODO idk how to not make this a constant
  address.search = `token=${secret}`;

  return format(address);
}

export async function requestProfileEdit(userId) {
  try {
    const {secret} = await User.createSecret(userId);
    console.log(await User.createSecret(userId));
    return secret;
  } catch (e) {
    throw new TraceError('Could create profile edit', e);
  }
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

export async function updateUserProfile(secret, attributes) {
  let updatedUser;

  try {
    const {id, phoneNumber, ...lastProps} = (await User.findBySecret(secret)).get();
    updatedUser = Object.assign(lastProps, attributes, {phoneNumber, id});
  } catch (e) {
    throw new TraceError(`Could not find user ${secret}`, e);
  }

  const {phoneNumber} = updatedUser;

  try {
    await console.tag('controller', 'updateUserProfile').log({updatedUser});
    await User.updateByPhoneNumber(phoneNumber, updatedUser);
    const user = (await User.findOneByPhoneNumber(phoneNumber)).get();

    // why use an emitter here?
    // does the user care about the chatbot? no
    Emitter.emit(Events.USER_PROFILE_UPDATED, user);

    return user;
  } catch (e) {
    throw new TraceError(`Could not update user ${secret}`, e);
  }
}

export {User as UserModel};
