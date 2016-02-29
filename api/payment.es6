/**
 * Created by kfu on 2/29/16.
 */

import Braintree from '../libs/payment/braintree.es6';
import config from 'config';
import * as User from './user.es6';
import * as Restaurant from './restaurant.es6';

const productionCreds = config.get('Braintree.production');
const sandboxCreds = config.get('Braintree.sandbox');
const logTags = ['api', 'braintree'];


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
export function getTestGateway() {
  const bt = sandboxBraintree;
  return bt.gateway;
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
      const result = await bt.transaction((amount / 100).toString(), restaurant.merchantId, restaurant.name,
        paymentMethodToken, customerId,
        (bt.calculateServiceFee(amount, restaurant.percentageFee, restaurant.transactionFee) / 100).toString());
      return result.transaction;
    } catch (transactionError) {
      console.tag(logTags).error(`Failed to Execute Transaction`, transactionError);
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
