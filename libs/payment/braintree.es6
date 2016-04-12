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
   * Creating a transaction that will be held in escrow
   * NOTE: The transaction has not been submitted to settlement yet
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
    const transactionSaleParameters = {
      amount,
      paymentMethodToken,
      customerId,
      /*
       Dynamic descriptors are sent on a per-transaction basis and
       define what will appear on your customers' credit card statements
       for a specific purchase. The clearer the description of your product,
       the less likely customers will issue chargebacks due to confusion
       or non-recognition.
       */
      // Descriptor name limited to 22 characters
      descriptor: {name: `Entree *${merchantName.substring(0, 13)}`},
      options: {
        submitForSettlement: true
      }
    };
    if (merchantAccountId !== this.masterMerchantAccountId) {
      transactionSaleParameters.serviceFeeAmount = serviceFeeAmount;
      transactionSaleParameters.options.holdInEscrow = true;
      transactionSaleParameters.merchantAccountId = merchantAccountId;
    }

    return new Promise((resolve, reject) => {
      this.gateway.transaction.sale(transactionSaleParameters, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * Voids an existing transaction
   * Note: Transaction must be of status authorized or submittedForSettlement
   * Voiding a transaction can occur while a transaction/sale is pending
   * while refunding occurs after the transaction/sales is no longer pending/has settled
   *
   * @param {String} transactionId: transaction id for the specific transaction of the order
   * @returns {Promise}: promise containing transaction result object
   */
  voidTransaction(transactionId) {
    return new Promise((resolve, reject) => {
      this.gateway.transaction.void(transactionId, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * Refunds an existing transaction
   * Note: Transaction must be of status settling or settled
   * Voiding a transaction can occur while a transaction/sale is pending
   * while refunding occurs after the transaction/sales is no longer pending/has settled
   *
   * @param {String} transactionId: transaction id for the specific transaction of the order
   * @returns {Promise}: promise containing transaction result object
   */
  refundTransaction(transactionId) {
    return new Promise((resolve, reject) => {
      this.gateway.transaction.refund(transactionId, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * Set an existing transaction as settled from submitted_for_settlement
   * NOTE: THIS IS ONLY USED FOR TESTING PURPOSES AND NOTHING ELSE
   * Braintree normally does this action on their end
   *
   * @param {String} transactionId: transaction id for the specific transaction of the order
   * @returns {Promise}: promise containing transaction result object
   */
  setTransactionAsSettled(transactionId) {
    return new Promise((resolve, reject) => {
      this.gateway.testing.settle(transactionId, (err, settleResult) => {
        if (err) reject(err);
        else resolve(settleResult);
      });
    });
  }

  /**
   * Release a transaction from escrow to the producer
   * Note: Whenever we make a transaction with a restaurant, we make them with a merchant account,
   * but that money/transaction sale does not get sent immediately to the merchant yet.
   * We hold onto this payment (in escrow) until we are ready to release the appropriate money
   * from the transactions/sales to the restaurant weekly (or however regularly we choose).
   * Releasing the correct transactions per merchant is necessary to be done with this function.
   *
   * @param {String} transactionId: id transactions to be released
   * @returns {Promise} result of the transaction
   */
  releaseTransactionsFromEscrow(transactionId) {
    return new Promise((resolve, reject) => {
      this.gateway.transaction.releaseFromEscrow(transactionId, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
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
        else {
          const creditCard = {paymentMethodNonce, options: {makeDefault: true, verifyCard: true}};
          this.gateway.customer.update(customer.id, {creditCard}, (updateError, result) => {
            if (updateError) {
              reject(new TraceError(`Failed to update payment method for ${customerId} via Braintree`, updateError));
            }
            resolve(result);
          });
        }
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
        else if (!result.success) reject(result);
        else resolve(result.merchantAccount);
      });
    });
  }

  /**
   * Updates an existing Braintree merchant account with individual, business, and funding objects
   * These accounts will be used to release funds to
   *
   * Details of what should be passed in to these calls are of the following:
   * https://developers.braintreepayments.com/guides/marketplace/onboarding/node#terms-of-service-accepted-parameter
   * https://developers.braintreepayments.com/reference/request/merchant-account/create/node
   *
   * @param {String} merchantId: merchant id of an existing producer
   * @param {Object} individual: object containing the individual business owner's information
   * @param {Object} business: object contained the business itself's information
   * @param {Object} funding: object containing necessary funding information
   * @returns {Promise}: promise containing result of creating merchant
   */
  updateMerchant(merchantId, individual, business, funding) {
    return new Promise((resolve, reject) => {
      const merchantAccountParams = {
        individual,
        business,
        funding
      };
      this.gateway.merchantAccount.update(merchantId, merchantAccountParams, (createMerchantErr, result) => {
        if (createMerchantErr) reject(createMerchantErr);
        else if (!result.success) reject(result);
        else resolve(result.merchantAccount);
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
