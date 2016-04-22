/**
 * Created by kfu on 3/4/16.
 */

import * as Braintree from '../api/payment.es6';
import {isEmpty} from '../libs/utils.es6';
import * as User from '../api/user.es6';
import * as Restaurant from '../api/restaurant.es6';
import assert from 'assert';
import {clearDatabase} from './test-init.es6';
import _ from 'underscore';
import braintree from 'braintree';
import config from 'config';
import supertest from 'supertest';
import Slack from '../libs/notifier/slack.es6';
import fetch from '../libs/fetch.es6';
const {SERVER_URL} = global;

const slackConfigs = config.get('Slack.Braintree');

const port = config.get('Server.port');
const serverUrl = `https://localhost:${port}`;
const server = supertest.agent(serverUrl);

beforeEach(() => clearDatabase());

describe('Braintree', () => {
  describe('#generateClientToken', () => {
    it('token generation', async done => {
      const clientToken = await Braintree.generateClientToken();
      assert(!isEmpty(clientToken));
      done();
    });

    it('multiple token generation', async done => {
      const clientToken1 = await Braintree.generateClientToken();
      const clientToken2 = await Braintree.generateClientToken();
      assert(!isEmpty(clientToken1));
      assert(!isEmpty(clientToken2));
      assert.notEqual(clientToken1, clientToken2);
      done();
    });

    it('api/v2/user/client-token single', async () => {
      const {body: {data: {clientToken}}} =
        await fetch(`${SERVER_URL}/api/v2/user/client-token/`);
      assert(!isEmpty(clientToken), 'Client Token is Empty');
    });

    it('api/v2/user/client-token multiple', async () => {
      const {body: {data: {clientToken: clientToken1}}} =
        await fetch(`${SERVER_URL}/api/v2/user/client-token/`);
      const {body: {data: {clientToken: clientToken2}}} =
        await fetch(`${SERVER_URL}/api/v2/user/client-token/`);
      assert(!isEmpty(clientToken1), 'Client Token is Empty');
      assert(!isEmpty(clientToken2), 'Client Token is Empty');
      assert.notEqual(clientToken1, clientToken2, 'both client tokens should be not equal');
    });
  });

  describe('Payment', () => {
    let userId;
    let restaurantId;
    let percentageFee;
    let transactionFee;
    beforeEach(async done => {
      // Customer Fields
      const phoneNumber = '1234567890';
      const firstName = 'Bob';
      const lastName = 'Smith';

      // Restaurant Fields
      const name = 'TestRestaurant';
      const handle = 'testrestaurant';
      const password = '1234';
      const mode = Restaurant.Mode.REGULAR;
      // Generated from previous merchant creations
      // NOTE: Sub Merchant accounts can only be created via the API
      // See https://sandbox.braintreegateway.com/merchants/ztyv8k2ffxjky29g/merchant_accounts
      const merchantId = 'approve_me_lastname_ins_4hrzrnvy';
      percentageFee = 5;
      transactionFee = 30;

      userId = (await User.create(phoneNumber, {firstName, lastName})).id;
      restaurantId = (await Restaurant.create(
        name, handle, password, mode, {percentageFee, transactionFee, merchantId})).id;

      done();
    });

    describe('#registerPaymentForUser', () => {
      const validNonce = 'fake-valid-nonce';

      function calculateServiceFee(orderTotal) {
        return Math.round(orderTotal * percentageFee / 100 + transactionFee);
      }

      const authorizedAmount = 100000; // $1000 or 100,000 cents
      const processorDeclinedAmount = 300000; // $3000 or 300,000 cents
      const gatewayRejectedAmount = 500100; // $5001.00 or 500,100 cents

      it('valid nonce should create transaction successfully', async done => {
        await Braintree.registerPaymentForUser(userId, validNonce);
        const defaultPayment = await Braintree.getCustomerDefaultPayment(userId);
        const transaction = await Braintree.paymentWithToken(userId, restaurantId,
                                                             defaultPayment.token, authorizedAmount);
        assert.deepEqual((authorizedAmount / 100), parseFloat(transaction.amount));
        assert.deepEqual((calculateServiceFee(authorizedAmount) / 100), parseFloat(transaction.serviceFeeAmount));
        assert.deepEqual('submitted_for_settlement', transaction.status);
        done();
      });

      it('declined processor should fail with processor response code', async done => {
        try {
          await Braintree.registerPaymentForUser(userId, validNonce);
          const defaultPayment = await Braintree.getCustomerDefaultPayment(userId);
          await Braintree.paymentWithToken(userId, restaurantId,
                                           defaultPayment.token, processorDeclinedAmount);
          assert(false);
        } catch (err) {
          const transaction = err;
          assert.deepEqual((processorDeclinedAmount / 100), parseFloat(transaction.amount));
          assert.deepEqual((calculateServiceFee(processorDeclinedAmount) / 100),
                           parseFloat(transaction.serviceFeeAmount));
          assert.deepEqual('failed', transaction.status);
          assert.deepEqual(processorDeclinedAmount / 100, parseFloat(transaction.processorResponseCode));
          done();
        }
      });

      it('gateway rejected should fail', async done => {
        try {
          await Braintree.registerPaymentForUser(userId, validNonce);
          const defaultPayment = await Braintree.getCustomerDefaultPayment(userId);
          await Braintree.paymentWithToken(userId, restaurantId,
                                           defaultPayment.token, gatewayRejectedAmount);
        } catch (err) {
          const transaction = err;
          assert.deepEqual((gatewayRejectedAmount / 100), parseFloat(transaction.amount));
          assert.deepEqual((calculateServiceFee(gatewayRejectedAmount) / 100),
                           parseFloat(transaction.serviceFeeAmount));
          assert.deepEqual('gateway_rejected', transaction.status);
          done();
        }
      });

      const gatewayRejectedNonces = [
        {
          nonce: 'fake-luhn-invalid-nonce',
          attribute: 'number',
          code: '81715',
          message: 'Credit card number is invalid.'
        },
        {
          nonce: 'fake-consumed-nonce',
          attribute: 'payment_method_nonce',
          code: '93107',
          message: 'Cannot use a payment_method_nonce more than once.'
        }
      ];

      _.each(gatewayRejectedNonces, ({nonce, attribute, code, message}) => {
        it(`${nonce} should fail with gateway rejected`, async done => {
          try {
            await Braintree.registerPaymentForUser(userId, nonce);
            assert(false);
          } catch (transactionErr) {
            const cause = transactionErr.cause();
            const deepErrors = cause.errors.deepErrors();
            const matchingError = _.findWhere(deepErrors, {attribute, code, message});
            // Check if matching error was found
            assert.ok(matchingError);
            done();
          }
        });
      });

      describe('#getCustomerDefaultPayment', () => {
        const ccNonces = {
          processorRejected: [
            {
              nonce: 'fake-processor-declined-visa-nonce',
              cardType: 'Visa'
            },
            {
              nonce: 'fake-processor-declined-amex-nonce',
              cardType: 'American Express'
            },
            {
              nonce: 'fake-processor-declined-mastercard-nonce',
              cardType: 'MasterCard'
            },
            {
              nonce: 'fake-processor-declined-discover-nonce',
              cardType: 'Discover'
            }
          ],
          valid: [
            {
              nonce: 'fake-valid-visa-nonce',
              cardType: 'Visa'
            },
            {
              nonce: 'fake-valid-amex-nonce',
              cardType: 'American Express'
            },
            {
              nonce: 'fake-valid-mastercard-nonce',
              cardType: 'MasterCard'
            },
            {
              nonce: 'fake-valid-discover-nonce',
              cardType: 'Discover'
            }
          ]
        };

        _.each(ccNonces.processorRejected, ({nonce, cardType}) => {
          it(`${nonce} should fail with processor declined`, async done => {
            try {
              await Braintree.registerPaymentForUser(userId, nonce);
              assert(false);
            } catch (transactionErr) {
              const verification = transactionErr.cause().verification;
              assert.deepEqual('processor_declined', verification.status);
              assert.deepEqual(verification.creditCard.cardType, cardType);
              try {
                await Braintree.getCustomerDefaultPayment(userId);
                assert(false);
              } catch (err) {
                // Should not be able to find customer
                done();
              }
            }
          });
        });

        _.each(ccNonces.valid, ({nonce, cardType}) => {
          it(`${nonce} should succeed to create a default payment of ${cardType}`, async done => {
            await Braintree.registerPaymentForUser(userId, nonce);
            const defaultPayment = await Braintree.getCustomerDefaultPayment(userId);
            const transaction = await Braintree.paymentWithToken(userId, restaurantId,
                                                                 defaultPayment.token, authorizedAmount);
            assert.deepEqual((authorizedAmount / 100), parseFloat(transaction.amount));
            assert.deepEqual((calculateServiceFee(authorizedAmount) / 100), parseFloat(transaction.serviceFeeAmount));
            assert.deepEqual('submitted_for_settlement', transaction.status);
            const defaultPayment2 = await Braintree.getCustomerDefaultPayment(userId);
            assert.deepEqual(defaultPayment2.cardType, cardType);
            done();
          });
        });

        it('multiple payments added should reflect default payment methods', async done => {
          // Customer Fields
          const phoneNumber = '9876543210';
          const firstName = 'Jack';
          const lastName = 'Jill';

          const userId2 = (await User.create(phoneNumber, {firstName, lastName})).get().id;
          for (let i = 0; i < ccNonces.valid.length; i++) {
            const {nonce, cardType} = ccNonces.valid[i];
            await Braintree.registerPaymentForUser(userId2, nonce);
            const defaultPayment = await Braintree.getCustomerDefaultPayment(userId2);
            const transaction = await Braintree.paymentWithToken(userId2, restaurantId,
                                                                 defaultPayment.token, authorizedAmount);
            assert.deepEqual(transaction.creditCard.cardType, cardType, 'Transaction Card Type Incorrect');
            assert.deepEqual((authorizedAmount / 100), parseFloat(transaction.amount));
            assert.deepEqual((calculateServiceFee(authorizedAmount) / 100), parseFloat(transaction.serviceFeeAmount));
            assert.deepEqual('submitted_for_settlement', transaction.status);
            const defaultPayment2 = await Braintree.getCustomerDefaultPayment(userId2);
            assert.deepEqual(defaultPayment2.cardType, cardType);
            if (i === 3) {
              done();
            }
          }
        });

        it(`should succeed with #paymentWithToken`, async done => {
          await Braintree.registerPaymentForUser(userId, ccNonces.valid[0].nonce);
          const defaultPayment = await Braintree.getCustomerDefaultPayment(userId);
          const transaction = await Braintree.paymentWithToken(userId, restaurantId,
                                                               defaultPayment.token, authorizedAmount);
          assert.deepEqual((authorizedAmount / 100), parseFloat(transaction.amount));
          assert.deepEqual((calculateServiceFee(authorizedAmount) / 100), parseFloat(transaction.serviceFeeAmount));
          assert.deepEqual('submitted_for_settlement', transaction.status);
          const defaultPayment2 = await Braintree.getCustomerDefaultPayment(userId);
          assert.deepEqual(defaultPayment2.cardType, ccNonces.valid[0].cardType);
          await Braintree.paymentWithToken(userId, restaurantId, defaultPayment2.token, authorizedAmount);
          done();
        });
      });

      it('#voidPayment should successfully void payment', async () => {
        await Braintree.registerPaymentForUser(userId, validNonce);
        const defaultPayment = await Braintree.getCustomerDefaultPayment(userId);
        const transaction = await Braintree.paymentWithToken(userId, restaurantId,
                                                             defaultPayment.token, authorizedAmount);
        assert.deepEqual((authorizedAmount / 100), parseFloat(transaction.amount));
        assert.deepEqual((calculateServiceFee(authorizedAmount) / 100), parseFloat(transaction.serviceFeeAmount));
        assert.deepEqual('submitted_for_settlement', transaction.status);
        const voidedTransaction = await Braintree.voidPayment(transaction.id);
        assert.deepEqual(voidedTransaction.status, 'voided');
      });

      it('#registerPaymentForUser should be settleable', async () => {
        await Braintree.registerPaymentForUser(userId, validNonce);
        const defaultPayment = await Braintree.getCustomerDefaultPayment(userId);
        const transaction = await Braintree.paymentWithToken(userId, restaurantId,
          defaultPayment.token, authorizedAmount);
        assert.deepEqual((authorizedAmount / 100), parseFloat(transaction.amount));
        assert.deepEqual((calculateServiceFee(authorizedAmount) / 100), parseFloat(transaction.serviceFeeAmount));
        assert.deepEqual('submitted_for_settlement', transaction.status);
        const settledTransaction = await Braintree.setTestTransactionAsSettled(transaction.id);
        assert.deepEqual('settled', settledTransaction.status);
      });

      it('#refundPayment should successfully refund payment', async () => {
        await Braintree.registerPaymentForUser(userId, validNonce);
        const defaultPayment = await Braintree.getCustomerDefaultPayment(userId);
        const transaction = await Braintree.paymentWithToken(userId, restaurantId,
                                                             defaultPayment.token, authorizedAmount);
        assert.deepEqual((authorizedAmount / 100), parseFloat(transaction.amount));
        assert.deepEqual((calculateServiceFee(authorizedAmount) / 100), parseFloat(transaction.serviceFeeAmount));
        assert.deepEqual('submitted_for_settlement', transaction.status);
        const settledTransaction = await Braintree.setTestTransactionAsSettled(transaction.id);
        assert.deepEqual('settled', settledTransaction.status);
        const refundedTransaction = await Braintree.refundPayment(transaction.id);
        assert.deepEqual('submitted_for_settlement', refundedTransaction.status);
        assert.deepEqual('credit', refundedTransaction.type);
        assert.notEqual(transaction.id, refundedTransaction.id);
      });

      it('#releasePaymentToProducer should successfully release payment to producer', async () => {
        await Braintree.registerPaymentForUser(userId, validNonce);
        const defaultPayment = await Braintree.getCustomerDefaultPayment(userId);
        const transaction = await Braintree.paymentWithToken(userId, restaurantId,
                                                             defaultPayment.token, authorizedAmount);
        assert.deepEqual((authorizedAmount / 100), parseFloat(transaction.amount));
        assert.deepEqual((calculateServiceFee(authorizedAmount) / 100), parseFloat(transaction.serviceFeeAmount));
        assert.deepEqual('submitted_for_settlement', transaction.status);
        const settledTransaction = await Braintree.setTestTransactionAsSettled(transaction.id);
        assert.deepEqual('settled', settledTransaction.status);
        const releasedPayment = await Braintree.releasePaymentToProducer(transaction.id);
        assert.deepEqual('settled', releasedPayment.status);
        assert.deepEqual('release_pending', releasedPayment.escrowStatus);
        assert.deepEqual(transaction.id, releasedPayment.id);
      });
    });
  });

  describe('#registerOrUpdateProducerWithPaymentSystem', () => {
    function createIndividual(approved) {
      return {
        firstName: approved ? braintree.Test.MerchantAccountTest.Approve :
          braintree.ValidationErrorCodes.MerchantAccount.ApplicantDetails.DeclinedOFAC,
        lastName: 'LastName',
        dateOfBirth: '1980-10-01',
        email: 'test@textentree.com',
        address: {
          streetAddress: '1234 Test St.',
          locality: 'Austin',
          region: 'TX',
          postalCode: '78705'
        }
      };
    }

    const individual2 = {
      firstName: braintree.Test.MerchantAccountTest.Approve,
      lastName: 'SecondLastName',
      dateOfBirth: '1950-01-01',
      email: 'test2@textentree.com',
      address: {
        streetAddress: '5678 Test St.',
        locality: 'Mountain View',
        region: 'CA',
        postalCode: '94035'
      }
    };

    const funding = {
      descriptor: 'test',
      destination: 'bank',
      accountNumber: '1123581321',
      routingNumber: '071101307'
    };

    const name = 'TestRestaurant2';
    const handle = 'testrestaurant2';
    const password = '1234';
    const mode = Restaurant.Mode.REGULAR;
    const percentageFee = 5;
    const transactionFee = 30;

    it('creating declined merchant account should fail', async done => {
      const restaurantId = (await Restaurant.create(name, handle, password, mode, {percentageFee, transactionFee})).id;
      const individual = createIndividual(false);
      try {
        const merchantAccount = await Braintree.registerOrUpdateProducerWithPaymentSystem(
          restaurantId, individual, {}, funding);
        assert.deepEqual(merchantAccount.status, 'suspended');
        assert.deepEqual(merchantAccount.subMerchantAccount, true);
        done();
      } catch (createMerchantErr) {
        assert(false, createMerchantErr);
        done();
      }
    });

    it('creating approved merchant account should succeed', async done => {
      const restaurantId = (await Restaurant.create(name, handle, password, mode, {percentageFee, transactionFee})).id;
      const individual = createIndividual(true);
      let merchantAccount = await Braintree.registerOrUpdateProducerWithPaymentSystem(
        restaurantId, individual, {}, funding);
      assert.deepEqual(merchantAccount.status, 'pending');
      assert.deepEqual(merchantAccount.subMerchantAccount, true);
      merchantAccount = await Braintree.findProducerPaymentSystemInfo(restaurantId);
      const resultIndividual = _.pick(merchantAccount.individual, _.allKeys(individual));
      assert.deepEqual(resultIndividual, individual);
      done();
    });

    it('updating merchant account should succeed', async done => {
      const restaurantId = (await Restaurant.create(name, handle, password, mode, {percentageFee, transactionFee})).id;
      const individual = createIndividual(true);
      await Braintree.registerOrUpdateProducerWithPaymentSystem(
        restaurantId, individual, {}, funding);
      const merchantAccount = await Braintree.registerOrUpdateProducerWithPaymentSystem(
        restaurantId, individual2, {}, {});
      assert.deepEqual(merchantAccount.status, 'active');
      const resultIndividual = _.pick(merchantAccount.individual, _.allKeys(individual2));
      assert.deepEqual(resultIndividual, individual2);
      done();
    });
  });

  describe('webhooks', () => {
    const slackbot = new Slack(slackConfigs.apiToken, slackConfigs.username);

    it('should fail when not send signature or payload', done => {
      server
        .post(`/braintree/webhooks`)
        .send({})
        .expect(500, done);
    });

    it('should fail with subscription since not implemented yet', async done => {
      try {
        const sampleNotification = Braintree.getGateway().webhookTesting.sampleNotification(
          braintree.WebhookNotification.Kind.SubscriptionWentPastDue,
          'myId'
        );
        await Braintree.parse(slackbot, sampleNotification.bt_signature, sampleNotification.bt_payload, true);
        done();
      } catch (err) {
        assert(false, err);
      }
    });

    it('should succeed with sample merchant account approved', async done => {
      try {
        const sampleNotification = Braintree.getGateway().webhookTesting.sampleNotification(
          braintree.WebhookNotification.Kind.SubMerchantAccountApproved,
          'myId'
        );
        await Braintree.parse(slackbot, sampleNotification.bt_signature, sampleNotification.bt_payload, true);
        done();
      } catch (err) {
        assert(false, err);
      }
    });

    it('should succeed with sample merchant account declined', async done => {
      try {
        const sampleNotification = Braintree.getGateway().webhookTesting.sampleNotification(
          braintree.WebhookNotification.Kind.SubMerchantAccountDeclined,
          'myId'
        );
        await Braintree.parse(slackbot, sampleNotification.bt_signature, sampleNotification.bt_payload, true);
        done();
      } catch (err) {
        assert(false, err);
      }
    });
  });
});
