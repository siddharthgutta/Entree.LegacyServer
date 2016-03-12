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

const productionCreds = config.get('Braintree.production');
const sandboxCreds = config.get('Braintree.sandbox');
const logTags = ['api', 'payment'];

/**
 * Payment strategy for Production
 * @type {Braintree}
 */
const productionBraintree = new Braintree(true, productionCreds.merchantId,
  productionCreds.publicKey, productionCreds.privateKey, productionCreds.masterMerchantAccountId);
/**
 * Payment strategy for Sandbox
 * @type {Braintree}
 */
const sandboxBraintree = new Braintree(false, sandboxCreds.merchantId,
  sandboxCreds.publicKey, sandboxCreds.privateKey, sandboxCreds.masterMerchantAccountId);

/**
 * Gives the Braintree Sandbox Gateway for testing
 *
 * @returns {Braintree.gateway} braintree sandbox gateway
 */
export function getGateway(production = false) {
  const bt = production ? productionBraintree : sandboxBraintree;
  return bt.gateway;
}

/**
 * Parses braintree signature and payload to check if valid
 *
 * @param {Slack} slackbot: Slack Bot Object to emit
 * @param {String} btSignature: braintree signature
 * @param {String} btPayload: braintree payload
 * @param {Boolean} production: whether or not production or sandbox
 * @returns {Promise} message promise or error
 */
export function parse(slackbot, btSignature, btPayload,
                      production = false, test = false) {
  return new Promise((resolve, reject) => {
    try {
      getGateway(production).webhookNotification.parse(btSignature, btPayload, (err, webhookNotification) => {
        if (err) reject(new Error('Webhook Notification Parsing Error - [Probably Incorrect Gateway]'));
        else {
          let color = '#764FA5';
          const fields = [];
          let msg = `~~~~~THIS IS ${test ? '' : 'NOT'} A TEST~~~~~`;
          msg += production ? `Production\n` : `Sandbox\nTimeStamp: ${webhookNotification.timestamp}\n`;
          fields.push(Slack.generateField('Environment', production ? `Production` : `Sandbox`));

          switch (webhookNotification.kind) {
            case braintree.WebhookNotification.Kind.SubMerchantAccountApproved:
              color = test ? color : 'good';
              fields.push(Slack.generateField('Merchant Account', `Approved`));
              fields.push(Slack.generateField('Merchant Status', `${webhookNotification.merchantAccount.status}`));
              fields.push(Slack.generateField('Merchant ID', `${webhookNotification.merchantAccount.id}`));
              msg += `Merchant Account: Approved\nStatus: ${webhookNotification.merchantAccount.status}\n`
                + `Merchant Id: ${webhookNotification.merchantAccount.id}`;
              console.tag(logTags).log(msg);
              resolve({kind: webhookNotification.kind, result: webhookNotification.merchantAccount});
              break;
            case braintree.WebhookNotification.Kind.SubMerchantAccountDeclined:
              color = test ? color : 'danger';
              fields.push(Slack.generateField('Merchant Account', `Declined`));
              fields.push(Slack.generateField('Reason Declined', `${webhookNotification.message}`));
              msg += `Merchant Account: Declined\nReason: ${webhookNotification.message}`;
              console.tag(logTags).error(msg, webhookNotification.errors);
              reject({kind: webhookNotification.kind, message: webhookNotification.message,
                errors: webhookNotification.errors});
              break;
            default:
              color = test ? color : '#3aa3e3';
              msg += `Notification Type: ${webhookNotification.kind}`;
              fields.push(Slack.generateField('Notification Type', `${webhookNotification.kind}`));
              console.tag(logTags).error(webhookNotification);
              reject(new Error(`Not implemented Error - ${JSON.stringify({kind: webhookNotification.kind,
                result: webhookNotification})}`));
              break;
          }

          const data = Slack.generateData(msg, color, fields, test);

          // Temporary Solution to prevent spamming
          if (!test) {
            slackbot.send(slackConfigs.channelId, data, '');
          }
        }
      });
    } catch (err) {
      console.tag(logTags).error(err);
      reject(err);
    }
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
  try {
    const merchantId = result.id;
    const restaurantId = (await Restaurant.findByMerchantId(merchantId)).id;
    switch (kind) {
      case braintree.WebhookNotification.Kind.SubMerchantAccountApproved:
        Restaurant.update(restaurantId, {merchantApproved: true});
        break;
      default:
        // Future Implementations of other Parse Result cases here
        break;
    }
  } catch (err) {
    throw err;
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
      try {
        // Check if production webhook
        const {kind, result} = await parse(braintreeSlackbot, btSignature, btPayload, true);
        await handleParseResult(kind, result);
      } catch (productionError) {
        // Check if sandbox webhook
        const {kind, result} = await parse(braintreeSlackbot, btSignature, btPayload, false);
        await handleParseResult(kind, result);
      }
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
 * @param {Boolean} production: production/sandbox braintree
 * @returns {Promise}: generated client token or error
 */
export async function generateClientToken(production = true) {
  const bt = production ? productionBraintree : sandboxBraintree;
  try {
    return await bt.generateClientToken();
  } catch (err) {
    console.tag(logTags).error(`Client Generation Token Error: ${err}`);
    throw err;
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
 * @param {Boolean} production: production/sandbox braintree
 * @returns {Promise}: returns the transaction object if successful, error if not
 */
async function makePayment(amount, merchantId, name, paymentMethodToken, customerId, serviceFee, production = true) {
  const bt = production ? productionBraintree : sandboxBraintree;
  try {
    const result = await bt.transaction(amount, merchantId, name, paymentMethodToken, customerId, serviceFee);
    if (!result.success && !result.errors.deepErrors()) {
      console.tag(logTags).error(`Failed to Execute Transaction`);
      console.tag(logTags).error(result.errors.deepErrors());
      throw result.transaction;
    } else if (!result.success) {
      console.tag(logTags).error(`Failed to Execute Transaction`);
      console.tag(logTags).error(result.transaction.status);
      throw result.transaction;
    } else {
      return result.transaction;
    }
  } catch (transactionError) {
    throw transactionError;
  }
}

/**
 * Create customer with Braintree and execute initial transaction
 * OR add new payment for existing customer
 *
 * @param {Number} userId: id of the user
 * @param {String} restaurantId: restaurant ID from db
 * @param {String} paymentMethodNonce: nonce from client browser
 * @param {Number} amount: total amount of order in cents $1.00 -> 100
 * @param {Boolean} production: production/sandbox braintree
 * @returns {Promise}: result of the transaction or error
 */
export async function paymentforCustomer(userId, restaurantId, paymentMethodNonce, amount, production = true) {
  const bt = production ? productionBraintree : sandboxBraintree;
  try {
    let customerResult;
    let user;
    try {
      user = await User.findOne(userId);
    } catch (findUserErr) {
      console.tag(logTags).error(`Failed to find User by Id: ${findUserErr}`);
      throw findUserErr;
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
        console.tag(logTags).error(`Failed to Create Customer:`, createCustomerErr);
        throw createCustomerErr;
      }
    } else {
      try {
        customerResult = await bt.addNewPaymentMethod(customerId, paymentMethodNonce);
      } catch (addPaymentMethodError) {
        console.tag(logTags).error(`Failed to Find/Update Customer:`, addPaymentMethodError);
        throw addPaymentMethodError;
      }
    }

    let paymentMethodToken;
    try {
      paymentMethodToken = bt.getDefaultPayment(customerResult.customer).token;
    } catch (defaultPaymentErr) {
      console.tag(logTags).error(`Failed to get Default Payment`, defaultPaymentErr);
      throw defaultPaymentErr;
    }

    let restaurant;
    try {
      restaurant = await Restaurant.findOne(restaurantId);
    } catch (findRestaurantErr) {
      console.tag(logTags).error(`Failed to find restaurant by id`, findRestaurantErr);
      throw findRestaurantErr;
    }

    try {
      const result = await makePayment((amount / 100).toString(), restaurant.merchantId, restaurant.name,
        paymentMethodToken, customerId,
        (bt.calculateServiceFee(amount, restaurant.percentageFee, restaurant.transactionFee) / 100).toString(),
        production);
      return result;
    } catch (transactionError) {
      console.tag(logTags).error(`Failed to Execute Transaction`, transactionError);
      throw transactionError;
    }
  } catch (err) {
    throw err;
  }
}

/**
 * Execute transaction with payment method token
 *
 * @param {Number} userId: id of the user
 * @param {String} restaurantId: restaurant ID from db
 * @param {String} paymentMethodToken: payment method token from braintree after calling getDefaultPayment
 * @param {Number} amount: total amount of order in cents $1.00 -> 100
 * @param {Boolean} production: production/sandbox braintree
 * @returns {Promise}: result of the transaction or error
 */
export async function paymentWithToken(userId, restaurantId, paymentMethodToken, amount, production = true) {
  const bt = production ? productionBraintree : sandboxBraintree;
  try {
    let user;
    try {
      user = await User.findOne(userId);
    } catch (findUserErr) {
      console.tag(logTags).error(`Failed to find User by Id: ${findUserErr}`);
      throw findUserErr;
    }
    const customerId = user.customerId;
    // Check if user does already have a customerId - indicates that signup2 hasn't occurred
    if (!customerId) {
      throw new Error('Failed to find customer Id. Customer id needs to exist before calling paymentWithToken.');
    }

    let restaurant;
    try {
      restaurant = await Restaurant.findOne(restaurantId);
    } catch (findRestaurantErr) {
      console.tag(logTags).error(`Failed to find restaurant by id`, findRestaurantErr);
      throw findRestaurantErr;
    }

    try {
      const result = await makePayment((amount / 100).toString(), restaurant.merchantId, restaurant.name,
        paymentMethodToken, customerId,
        (bt.calculateServiceFee(amount, restaurant.percentageFee, restaurant.transactionFee) / 100).toString(),
        production);
      return result;
    } catch (transactionError) {
      throw transactionError;
    }
  } catch (err) {
    throw err;
  }
}

/**
 * Gets default payment method in braintree for specific user
 *
 * @param {Number} userId: id of the user
 * @param {Boolean} production: production/sandbox braintree
 * @returns {Object}: object containing cardType, last4 digits, and paymentMethodToken is they exist
 */
export async function getCustomerDefaultPayment(userId, production = true) {
  const bt = production ? productionBraintree : sandboxBraintree;
  try {
    let customer;
    try {
      customer = await User.findOne(userId);
    } catch (findUserErr) {
      console.tag(logTags).error(`Failed to Find User: ${findUserErr}`);
      throw findUserErr;
    }

    try {
      customer = await bt.findCustomer(customer.customerId);
    } catch (findCustomerErr) {
      console.tag(logTags).error(`Failed to Find Customer: ${findCustomerErr}`);
      throw findCustomerErr;
    }

    try {
      return await bt.getDefaultPayment(customer);
    } catch (findingPaymentErr) {
      console.tag(logTags).error(`Failed to Find Default Payment Method: ${findingPaymentErr}`);
      throw findingPaymentErr;
    }
  } catch (err) {
    throw err;
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
 * @param {Boolean} production: production/sandbox braintree
 * @returns {Promise}: promise containing resulting merchant account object
 */
export async function createMerchantAccount(restaurantId, individual, business, funding, production = true) {
  const bt = production ? productionBraintree : sandboxBraintree;
  try {
    let merchantAccount;
    try {
      merchantAccount = await bt.createMerchant(individual, business, funding);
    } catch (createMerchantErr) {
      console.tag(logTags).error(`Failed to create merchant account`, createMerchantErr);
      throw createMerchantErr;
    }

    try {
      await Restaurant.update(restaurantId, {merchantId: merchantAccount.id});
    } catch (restaurantUpdateErr) {
      console.tag(logTags).error(`Failed to find update restaurant merchant id`, restaurantUpdateErr);
      throw restaurantUpdateErr;
    }

    return merchantAccount;
  } catch (err) {
    throw err;
  }
}
