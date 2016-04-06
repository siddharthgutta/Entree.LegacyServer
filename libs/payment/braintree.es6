/**
 * Created by kfu on 2/27/16.
 */

import PaymentStrategy from './strategy.es6';
import braintree from 'braintree';
import Promise from 'bluebird';
import _ from 'underscore';

export default class Braintree extends PaymentStrategy {
  /**
   * Constructs the gateway for braintree transactions/operations to occur
   *
   * @param {Boolean} production: boolean switch for creating Sandbox or Production gateway
   * @param {String} merchantId: Braintree Account's merchant identification
   * @param {String} publicKey: Braintree Account's public key
   * @param {String} privateKey: Braintree Account's private key
   * @param {String} masterMerchantAccountId: Master Merchant Account Id set on Braintree Account
   * @returns {Braintree}: Braintree object
   */
  constructor(production = false, merchantId, publicKey, privateKey, masterMerchantAccountId) {
    super();
    this.masterMerchantAccountId = masterMerchantAccountId;
    const btEnv = production ? braintree.Environment.Production : braintree.Environment.Sandbox;
    this.gateway = braintree.connect({
      environment: btEnv,
      merchantId,
      publicKey,
      privateKey
    });
  }

  // Unsure if necessary yet
  /**
   * Normalizing phone number for insertion into braintree calls
   *
   * @param {String} phoneNumber: phone number to normalize in the following form: NNNNNNNNNN
   * @returns {string} phoneNumber string in the following form: NNN.NNN.NNNN
   */
  normalizePhoneNumber(phoneNumber) {
    return [phoneNumber.substr(0, 3), phoneNumber.substr(3, 3), phoneNumber.substr(6, 4)].join('.');
  }

  /**
   * Generates a new client token to be sent to the front end
   *
   * @returns {Promise}: promise containing generated client token
   */
  generateClientToken() {
    return new Promise((resolve, reject) => {
      this.gateway.clientToken.generate({}, (err, response) => {
        if (err) reject(err);
        resolve(response.clientToken);
      });
    });
  }

  /**
   * Creating a transaction that will be held in escrow/submitted for settlement
   *
   * @param {String} amount: total charged amount Ex: 100.00
   * @param {String} merchantAccountId: associated with a restaurant id
   * @param {String} merchantName: name of restaurant used for descriptor
   * @param {String} paymentMethodToken: token resulting from customer payment method creation
   * @param {String} customerId: id of customer in braintree
   * @param {String} serviceFeeAmount: calculated amount to take as a service fee Ex: 10.00
   * @returns {Promise}: promise containing transaction result object
   */
  transaction(amount, merchantAccountId, merchantName, paymentMethodToken, customerId, serviceFeeAmount) {
    return new Promise((resolve, reject) => {
      this.gateway.transaction.sale({
        amount,
        merchantAccountId,
        paymentMethodToken,
        customerId,
        /*
         Dynamic descriptors are sent on a per-transaction basis and
         define what will appear on your customers' credit card statements
         for a specific purchase. The clearer the description of your product,
         the less likely customers will issue chargebacks due to confusion
         or non-recognition.
         */
        descriptor: {name: `Entree*${merchantName}`, url: 'textentree.com'},
        options: {
          submitForSettlement: true,
          holdInEscrow: true
        },
        serviceFeeAmount
      }, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  /**
   * Release an list of transactions from escrow to the merchants
   *
   * @param {Array} transactionIds: array of transactions by id to be released
   * @returns {Error} error since not implemented
   */
  releaseTransactionsFromEscrow(transactionIds) {
    throw new Error('Implementation Not Finished', transactionIds);
    /*
    let releaseBatchPromises = {};
    transactionIds.forEach(transactionId => {
      releaseBatchPromises[transactionId] = new Promise((resolve, reject) => {
        this.gateway.transaction.releaseFromEscrow(transactionId, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    });

    // Probably not used for SXSW
    // Temporary Solution for now
    Promise.props(Object.keys(releaseBatchPromises).reduce((newObject, key) => {
      newObject[key] = releaseBatchPromises[key].reflect();
      return newObject;
    }, {})).then(resolvedPromises => {
      transactionIds.forEach(transactionId => {
        if (resolvedPromises[transactionId].isFulfilled()) {
          console.log(`Successfully Released Transaction: ${resolvedPromises[transactionId.value()}`);
          // Do something here to mark transaction released
        } else {
          console.log(`Failed to Releasee Transaction: ${resolvedPromises[transactionId.value()}`);
          // Do something here to mark transaction failed to be released
        }
      });
    });
    */
  }

  /**
   * Creates a new customer with payment nonce
   *
   * @param {String} firstName: first name from client
   * @param {String} lastName: last name from client
   * @param {String} phone: phone number of user from server
   * @param {String} paymentMethodNonce: nonce for payment from client
   * @returns {Promise}:  promise containing result of customer creation
   *
   */
  createCustomer(firstName, lastName, phone, paymentMethodNonce) {
    return new Promise((resolve, reject) => {
      const creditCard = {options: {makeDefault: true, verifyCard: true}};
      this.gateway.customer.create({firstName, lastName, phone, paymentMethodNonce, creditCard}, (err, result) => {
        if (err) reject(err);
        else if (!result.success) reject(result);
        resolve(result);
      });
    });
  }

  /**
   * Retrieves the default payment card Type, last 4 digits,
   * and paymentMethodToken from a customer Object
   *
   * @param {Customer} customer: Braintree customer object
   * @returns {Object}: containing cardType, last4 digits, and paymentMethodToken is they exist
   */
  getDefaultPayment(customer) {
    return new Promise((resolve, reject) => {
      const defaultPaymentMethod = _.findWhere(customer.paymentMethods, {default: true});
      const filteredPaymentMethod = _.pick(defaultPaymentMethod, ['cardType', 'last4', 'token']);
      if (_.isEmpty(filteredPaymentMethod)) reject('Could not find a default payment method');
      resolve(filteredPaymentMethod);
    });
  }

  /**
   * Gets the corresponding customer object from braintree
   *
   * @param {String} customerId: customer ID stored in our db
   * @returns {Promise}: customer result object
   */
  findCustomer(customerId) {
    return new Promise((resolve, reject) => {
      this.gateway.customer.find(customerId, (err, customer) => {
        if (err) reject(err);
        resolve(customer);
      });
    });
  }

  /**
   * Adds a new payment method associated with a customer
   *
   * @param {String} customerId: customerID stored under user
   * @param {String} paymentMethodNonce: nonce returned from front end browser
   * @returns {Promise}: promise containing result of adding payment
   */
  addNewPaymentMethod(customerId, paymentMethodNonce) {
    return new Promise((resolve, reject) => {
      this.gateway.customer.find(customerId, (findError, customer) => {
        if (findError) reject(new TraceError(`Failed to find customer by ${customerId} via Braintree`, findError));
        const creditCard = {paymentMethodNonce, options: {makeDefault: true, verifyCard: true}};
        this.gateway.customer.update(customer.id, {creditCard}, (updateError, result) => {
          if (updateError) {
            reject(new TraceError(`Failed to update payment method for ${customerId} via Braintree`, updateError));
          }
          resolve(result);
        });
      });
    });
  }

  /**
   * Creates a new Braintree merchant account with individual, business, and funding objects
   * These accounts will be used to release funds to
   *
   * Details of what should be passed in to these calls are of the following:
   * https://developers.braintreepayments.com/guides/marketplace/onboarding/node#terms-of-service-accepted-parameter
   * https://developers.braintreepayments.com/reference/request/merchant-account/create/node
   *
   * @param {Object} individual: object containing the individual business owner's information
   * @param {Object} business: object contained the business itself's information
   * @param {Object} funding: object containing necessary funding information
   * @returns {Promise}: promise containing result of creating merchant
   */
  createMerchant(individual, business, funding) {
    return new Promise((resolve, reject) => {
      const merchantAccountParams = {
        individual,
        business,
        funding,
        tosAccepted: true,
        masterMerchantAccountId: this.masterMerchantAccountId
      };
      this.gateway.merchantAccount.create(merchantAccountParams, (createMerchantErr, result) => {
        if (createMerchantErr) reject(createMerchantErr);
        if (!result.success) reject(result);
        resolve(result.merchantAccount);
      });
    });
  }

  /**
   * Gets the corresponding merchant account object from braintree
   *
   * @param {String} merchantId: merchantId stored under user
   * @returns {Promise}: promise containing the found merchant account
   */
  findMerchant(merchantId) {
    return new Promise((resolve, reject) => {
      this.gateway.merchantAccount.find(merchantId, (findMerchantErr, merchantAccount) => {
        if (findMerchantErr) reject(findMerchantErr);
        resolve(merchantAccount);
      });
    });
  }
}
