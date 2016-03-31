/**
 * Created by kfu on 2/29/16.
 */

import Braintree from '../libs/payment/braintree.es6';
import config from 'config';
import * as User from './user.es6';
import * as Restaurant from './restaurant.es6';
const slackConfigs = config.get('Slack.Braintree');
import Slack from '../libs/notifier/slack.es6';
import Promise from 'bluebird';
import braintree from 'braintree';
import {Router} from 'express';
import bodyParser from 'body-parser';
import * as Runtime from '../libs/runtime.es6';
import selectn from 'selectn';
import {isEmpty} from '../libs/utils.es6';

// Braintree Config credentials for Production or Sandbox
const productionOrSandbox = Runtime.isProduction();
const braintreeCreds = config.get(`Braintree.${productionOrSandbox ? 'production' : 'sandbox'}`);
const logTags = ['api', 'payment'];

/**
 * Payment strategy for Production or Sandbox
 * @type {Braintree}
 */
const bt = new Braintree(productionOrSandbox, braintreeCreds.merchantId,
  braintreeCreds.publicKey, braintreeCreds.privateKey, braintreeCreds.masterMerchantAccountId);

/**
 * Gives the Braintree Sandbox Gateway for testing
 *
 * @returns {Braintree.gateway} braintree gateway
 */
export function getGateway() {
  return bt.gateway;
}

/**
 * Parses braintree signature and payload to check if valid
 *
 * @param {Slack} slackbot: Slack Bot Object to emit
 * @param {String} btSignature: braintree signature
 * @param {String} btPayload: braintree payload
 * @returns {Promise} message promise or error
 */
export function parse(slackbot, btSignature, btPayload, test = false) {
  return new Promise((resolve, reject) => {
    getGateway().webhookNotification.parse(btSignature, btPayload, async (err, webhookNotification) => {
      if (err) reject(new TraceError('Webhook Notification Parsing Error - [Probably Incorrect Gateway]'));
      else {
        let color = '#764FA5';
        const fields = [];
        let msg = `~~~~~THIS IS ${test ? '' : 'NOT'} A TEST~~~~~`;
        msg += productionOrSandbox ? `Production\n` : `Sandbox\nTimeStamp: ${webhookNotification.timestamp}\n`;
        fields.push(Slack.generateField('Environment', productionOrSandbox ? `Production` : `Sandbox`));

        switch (webhookNotification.kind) {
          case braintree.WebhookNotification.Kind.SubMerchantAccountApproved:
            color = test ? color : 'good';
            const dbaName = selectn('business.dbaName', webhookNotification.merchantAccount);
            fields.push(Slack.generateField('Merchant Account', `Approved`));
            fields.push(Slack.generateField('Merchant Status', `${webhookNotification.merchantAccount.status}`));
            fields.push(Slack.generateField('Merchant ID', `${webhookNotification.merchantAccount.id}`));
            fields.push(Slack.generateField('Merchant Name', isEmpty(dbaName) ? 'Unnamed' : dbaName));
            msg += `Merchant Account: Approved\nStatus: ${webhookNotification.merchantAccount.status}\n`
              + `Merchant Id: ${webhookNotification.merchantAccount.id}`;
            resolve({kind: webhookNotification.kind, result: webhookNotification.merchantAccount});
            break;
          case braintree.WebhookNotification.Kind.SubMerchantAccountDeclined:
            color = test ? color : 'danger';
            fields.push(Slack.generateField('Merchant Account', `Declined`));
            fields.push(Slack.generateField('Reason Declined', `${webhookNotification.message}`));
            msg += `Merchant Account: Declined\nReason: ${webhookNotification.message}`;
            resolve({message: webhookNotification.message, kind: webhookNotification.kind,
              errors: webhookNotification.errors});
            break;
          default:
            color = test ? color : '#3aa3e3';
            msg += `Notification Type: ${webhookNotification.kind}`;
            fields.push(Slack.generateField('Notification Type', `${webhookNotification.kind}`));
            resolve({error: 'Not Implemented Error', kind: webhookNotification.kind,
              result: webhookNotification});
            break;
        }

        const data = Slack.generateData(msg, color, fields, test);

        // Temporary fix to prevent merchant spam
        // Making sandbox stop spamming #merchants completely
        // NOTE: This means only production will fire slack notifications for webhooks
        // When wanting to test webhooks for sandbox, remove '&& productionOrSandbox'
        if (!test) {
          slackbot.send(slackConfigs.channelId, data, '');
        }
      }
    });
  });
}

/**
 * Handles the parse results from webhook notifications via braintree
 *
 * @param {braintree.WebhookNotification.Kind} kind: type of braintree webhook notification
 * @param {Object} result: resulting braintree object, i.e. merchantAccount
 * @returns {Promise}: result of parsing the message
 */
async function handleParseResult(kind, result) {
  switch (kind) {
    case braintree.WebhookNotification.Kind.SubMerchantAccountApproved:
      // Requiring an existing restaurant for a merchantId if in production mode
      if (productionOrSandbox) {
        try {
          const merchantId = result.id;
          const restaurantId = (await Restaurant.findByMerchantId(merchantId)).get().id;
          await Restaurant.update(restaurantId, {merchantApproved: true});
        } catch (err) {
          throw new TraceError('Could not update merchant to be approved by merchantId', err);
        }
      }
      break;
    default:
      // Future Implementations of other Parse Result cases here
      break;
  }
}

/**
 * Webhook for Braintree Webhook Notifications
 *
 * @returns {null} return object not used
 */
export function initRouter() {
  /**
   * Braintree Slack Bot
   *
   * @type {Slack}
   */
  const braintreeSlackbot = new Slack(slackConfigs.apiToken, slackConfigs.username);
  const route = new Router();
  route.use(bodyParser.urlencoded({extended: true}));

  route.post(`/webhooks`, async (req, res) => {
    const btSignature = req.body.bt_signature;
    const btPayload = req.body.bt_payload;
    try {
      if (!btSignature || !btPayload) {
        throw new TraceError('Empty Braintree Signature/Payload');
      }

      // Parse webhook
      const {kind, result} = await parse(braintreeSlackbot, btSignature, btPayload);
      await handleParseResult(kind, result);
      res.status(200).send('Webhook Success');
    } catch (err) {
      console.tag(logTags).error(err);
      res.status(500).send('Webhook Failed');
    }
  });
  return route;
}

/**
 * Generate Client Token to pass to the client browser
 *
 * @returns {Promise}: generated client token or error
 */
export async function generateClientToken() {
  try {
    return await bt.generateClientToken();
  } catch (err) {
    throw new TraceError('Client Generation Token Error for generateClientToken', err);
  }
}

/**
 * Makes a real braintree payment
 *
 * @param {String} amount: string amount to pay, converted from number
 * @param {String} merchantId: merchant Id from braintree
 * @param {String} name: restaurant name
 * @param {String} paymentMethodToken: token gotten for a specific payment method
 * @param {String} customerId: customer Id from braintree
 * @param {String} serviceFee: string amount service fee that we take
 * @returns {Promise}: returns the transaction object if successful, error if not
 */
async function makePayment(amount, merchantId, name, paymentMethodToken, customerId, serviceFee) {
  const result = await bt.transaction(amount, merchantId, name, paymentMethodToken, customerId, serviceFee);
  if (!result.success && !isEmpty(result.errors) && !isEmpty(result.errors.deepErrors())) {
    console.tag(logTags).error(`Validation Errors on makePayment`);
    console.tag(logTags).error(result.errors.deepErrors());
    throw result.transaction;
  } else if (!result.success) {
    console.tag(logTags).error(`Failed to Execute Transaction on makePayment`);
    console.tag(logTags).error(result.transaction);
    throw result.transaction;
  } else {
    return result.transaction;
  }
}

/**
 * Create customer with Braintree and execute initial transaction
 * OR add new payment for existing customer
 *
 * @param {String} userId: id of the user
 * @param {String} paymentMethodNonce: nonce from client browser
 * @returns {Promise}: result of the transaction or error
 */
export async function registerPaymentForUser(userId, paymentMethodNonce) {
  let customerResult;
  let user;
  try {
    user = await User.findOne(userId);
  } catch (findUserErr) {
    throw new TraceError('Failed to find User by Id for registerPaymentForUser', findUserErr);
  }
  const phone = user.phoneNumber;
  let customerId = user.customerId;
  // Check if user does already have a customerId - indicates that signup2 hasn't occurred
  if (!customerId) {
    try {
      const firstName = user.firstName;
      const lastName = user.lastName;

      customerResult = await bt.createCustomer(firstName, lastName, phone, paymentMethodNonce);
      customerId = customerResult.customer.id;
      await User.update(userId, {customerId});
    } catch (createCustomerErr) {
      throw new TraceError('Failed to Create Customer for registerPaymentForUser', createCustomerErr);
    }
  } else {
    try {
      customerResult = await bt.addNewPaymentMethod(customerId, paymentMethodNonce);
    } catch (addPaymentMethodError) {
      throw new TraceError('Failed to Find/Update Customer for registerPaymentForUser', addPaymentMethodError);
    }
  }
  return customerResult;
}

/**
 * Execute transaction with payment method token
 *
 * @param {Number} userId: id of the user
 * @param {String} restaurantId: restaurant ID from db
 * @param {String} paymentMethodToken: payment method token from braintree after calling getDefaultPayment
 * @param {Number} amount: total amount of order in cents $1.00 -> 100
 * @returns {Promise}: result of the transaction or error
 */
export async function paymentWithToken(userId, restaurantId, paymentMethodToken, amount) {
  let user;
  try {
    user = await User.findOne(userId);
  } catch (findUserErr) {
    throw new TraceError('Failed to find User by Id for paymentWithToken', findUserErr);
  }
  const customerId = user.customerId;
  // Check if user does already have a customerId - indicates that signup2 hasn't occurred
  if (!customerId) {
    throw new TraceError('Customer Id not found for paymentWithToken');
  }

  let restaurant;
  try {
    restaurant = await Restaurant.findOne(restaurantId);
  } catch (findRestaurantErr) {
    throw new TraceError('Failed to find restaurant by Id for paymentWithToken', findRestaurantErr);
  }

  try {
    const amountString = (amount / 100).toString();
    const serviceFeeString = (bt.calculateServiceFee(amount, restaurant.percentageFee,
                                                     restaurant.transactionFee) / 100).toString();
    const result = await makePayment(amountString, restaurant.merchantId, restaurant.name,
                                     paymentMethodToken, customerId, serviceFeeString);
    return result;
  } catch (transactionError) {
    throw transactionError;
  }
}

/**
 * Gets default payment method in braintree for specific user
 *
 * @param {Number} userId: id of the user
 * @returns {Object}: object containing cardType, last4 digits, and paymentMethodToken is they exist
 */
export async function getCustomerDefaultPayment(userId) {
  let customer;
  try {
    customer = await User.findOne(userId);
  } catch (findUserErr) {
    throw new TraceError('Failed to Find User in getCustomerDefaultPayment', findUserErr);
  }

  try {
    customer = await bt.findCustomer(customer.customerId);
  } catch (findCustomerErr) {
    throw new TraceError('Failed to Find Customer in getCustomerDefaultPayment', findCustomerErr);
  }

  try {
    return await bt.getDefaultPayment(customer);
  } catch (findingPaymentErr) {
    throw new TraceError('Failed to Find Default Payment Method in getCustomerDefaultPayment', findingPaymentErr);
  }
}

/**
 * Creates a new Braintree merchant account with individual, business, and funding objects
 * These accounts will be used to release funds to
 *
 * Details of what should be passed in to these calls are of the following:
 * https://developers.braintreepayments.com/guides/marketplace/onboarding/node#terms-of-service-accepted-parameter
 * https://developers.braintreepayments.com/reference/request/merchant-account/create/node
 *
 * @param {String} restaurantId: restaurant ID from db
 * @param {Object} individual: object containing the individual business owner's information
 * @param {Object} business: object contained the business itself's information
 * @param {Object} funding: object containing necessary funding information
 * @returns {Promise}: promise containing resulting merchant account object
 */
export async function registerRestaurantWithPaymentSystem(restaurantId, individual, business, funding) {
  let merchantAccount;
  try {
    merchantAccount = await bt.createMerchant(individual, business, funding);
  } catch (createMerchantErr) {
    throw new TraceError('Failed to create merchant account for registerRestaurantWithPaymentSystem',
      createMerchantErr);
  }

  try {
    await Restaurant.update(restaurantId, {merchantId: merchantAccount.id});
  } catch (restaurantUpdateErr) {
    throw new TraceError('Failed to find/update restaurant by merchant id for registerRestaurantWithPaymentSystem',
      restaurantUpdateErr);
  }

  return merchantAccount;
}