/**
 * Created by kfu on 3/4/16.
 */

import * as Braintree from '../api/payment.es6';
import {isEmpty} from '../libs/utils.es6';
import * as User from '../api/user.es6';
import * as Restaurant from '../api/restaurant.es6';
import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import _ from 'underscore';
import braintree from 'braintree';
import config from 'config';
import supertest from 'supertest';
import Slack from '../libs/notifier/slack.es6';
const slackConfigs = config.get('Slack.Braintree');

const port = config.get('Server.port');
const serverUrl = `https://localhost:${port}`;
const server = supertest.agent(serverUrl);

beforeEach(done => {
  clearDatabase().then(() => done());
});

after(() => disconnectDatabase());

describe('Braintree', () => {
  describe('#generateClientToken', () => {
    it('sandbox token generation', async done => {
      const clientToken = await Braintree.generateClientToken(false);
      assert(!isEmpty(clientToken));
      done();
    });

    it('production token generation', async done => {
      const clientToken = await Braintree.generateClientToken();
      assert(!isEmpty(clientToken));
      done();
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
      const password = '1234';
      const mode = Restaurant.Mode.REGULAR;
      // Generated from previous merchant creations
      // NOTE: Sub Merchant accounts can only be created via the API
      // See https://sandbox.braintreegateway.com/merchants/ztyv8k2ffxjky29g/merchant_accounts
      const merchantId = 'approve_me_lastname_ins_4hrzrnvy';
      percentageFee = 5;
      transactionFee = 30;

      userId = (await User.create(phoneNumber, {firstName, lastName})).get().id;
      restaurantId = (await Restaurant.create(
        name, password, mode, {percentageFee, transactionFee, merchantId})).get().id;

      done();
    });

    describe('#paymentforCustomer', () => {
      const validNonce = 'fake-valid-nonce';

      function calculateServiceFee(orderTotal) {
        return Math.round(orderTotal * percentageFee / 100 + transactionFee);
      }
      const authorizedAmount = 100000; // $1000 or 100,000 cents
      const processorDeclinedAmount = 300000; // $3000 or 300,000 cents
      const gatewayRejectedAmount = 500100; // $5001.00 or 500,100 cents

      it('valid nonce should create transaction successfully', async done => {
        const transaction = await Braintree.paymentforCustomer(
          userId, restaurantId, validNonce, authorizedAmount, false);
        assert.deepEqual((authorizedAmount / 100), parseFloat(transaction.amount));
        assert.deepEqual((calculateServiceFee(authorizedAmount) / 100), parseFloat(transaction.serviceFeeAmount));
        assert.deepEqual('submitted_for_settlement', transaction.status);
        done();
      });

      it('declined processor should fail with processor response code', async done => {
        try {
          await Braintree.paymentforCustomer(
            userId, restaurantId, validNonce, processorDeclinedAmount, false);
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
          await Braintree.paymentforCustomer(
            userId, restaurantId, validNonce, gatewayRejectedAmount, false);
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
            await Braintree.paymentforCustomer(
              userId, restaurantId, nonce, authorizedAmount, false);
            assert(false);
          } catch (transactionErr) {
            const deepErrors = transactionErr.errors.for('customer').deepErrors();
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
              await Braintree.paymentforCustomer(
                userId, restaurantId, nonce, authorizedAmount, false);
              assert(false);
            } catch (transactionErr) {
              const verification = transactionErr.verification;
              assert.deepEqual('processor_declined', verification.status);
              assert.deepEqual(verification.creditCard.cardType, cardType);
              try {
                await Braintree.getCustomerDefaultPayment(userId, false);
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
            const transaction = await Braintree.paymentforCustomer(
              userId, restaurantId, nonce, authorizedAmount, false);
            console.log(transaction);
            assert.deepEqual((authorizedAmount / 100), parseFloat(transaction.amount));
            assert.deepEqual((calculateServiceFee(authorizedAmount) / 100), parseFloat(transaction.serviceFeeAmount));
            assert.deepEqual('submitted_for_settlement', transaction.status);
            const defaultPayment = await Braintree.getCustomerDefaultPayment(userId, false);
            assert.deepEqual(defaultPayment.cardType, cardType);
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
            const transaction = await Braintree.paymentforCustomer(
              userId2, restaurantId, nonce, authorizedAmount, false);
            assert.deepEqual(transaction.creditCard.cardType, cardType, 'Transaction Card Type Incorrect');
            assert.deepEqual((authorizedAmount / 100), parseFloat(transaction.amount));
            assert.deepEqual((calculateServiceFee(authorizedAmount) / 100), parseFloat(transaction.serviceFeeAmount));
            assert.deepEqual('submitted_for_settlement', transaction.status);
            const defaultPayment = await Braintree.getCustomerDefaultPayment(userId2, false);
            assert.deepEqual(defaultPayment.cardType, cardType);
            if (i === 3) {
              done();
            }
          }
        });

        it(`should succeed with #paymentWithToken`, async done => {
          const transaction = await Braintree.paymentforCustomer(
            userId, restaurantId, ccNonces.valid[0].nonce, authorizedAmount, false);
          console.log(transaction);
          assert.deepEqual((authorizedAmount / 100), parseFloat(transaction.amount));
          assert.deepEqual((calculateServiceFee(authorizedAmount) / 100), parseFloat(transaction.serviceFeeAmount));
          assert.deepEqual('submitted_for_settlement', transaction.status);
          const defaultPayment = await Braintree.getCustomerDefaultPayment(userId, false);
          assert.deepEqual(defaultPayment.cardType, ccNonces.valid[0].cardType);
          await Braintree.paymentWithToken(userId, restaurantId, defaultPayment.token, authorizedAmount, false);
          done();
        });
      });
    });
  });

  describe('#createMerchantAccount', () => {
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

    const funding = {
      descriptor: 'test',
      destination: 'bank',
      accountNumber: '1123581321',
      routingNumber: '071101307'
    };

    let restaurantId;
    before(async done => {
      // Restaurant Fields
      const name = 'TestRestaurant2';
      const password = '1234';
      const mode = Restaurant.Mode.REGULAR;
      const percentageFee = 5;
      const transactionFee = 30;

      restaurantId = (await Restaurant.create(name, password, mode, {percentageFee, transactionFee})).get().id;
      done();
    });

    it('creating declined merchant account should fail', async done => {
      const individual = createIndividual(false);
      try {
        const merchantAccount = await Braintree.createMerchantAccount(
          restaurantId, individual, {}, funding, false);
        assert.deepEqual(merchantAccount.status, 'suspended');
        assert.deepEqual(merchantAccount.subMerchantAccount, true);
        done();
      } catch (createMerchantErr) {
        assert(false);
        done();
      }
    });

    it('creating approved merchant account should succeed', async done => {
      const individual = createIndividual(true);
      const merchantAccount = await Braintree.createMerchantAccount(
        restaurantId, individual, {}, funding, false);
      assert.deepEqual(merchantAccount.status, 'pending');
      assert.deepEqual(merchantAccount.subMerchantAccount, true);
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
        const sampleNotification = Braintree.getGateway(false).webhookTesting.sampleNotification(
          braintree.WebhookNotification.Kind.SubscriptionWentPastDue,
          'myId'
        );
        Braintree.parse(slackbot, sampleNotification.bt_signature, sampleNotification.bt_payload, false, true);
        assert(false);
      } catch (err) {
        done();
      }
    });

    it('should succeed with sample merchant account approved', async done => {
      try {
        const sampleNotification = Braintree.getGateway(false).webhookTesting.sampleNotification(
          braintree.WebhookNotification.Kind.SubMerchantAccountApproved,
          'myId'
        );
        Braintree.parse(slackbot, sampleNotification.bt_signature, sampleNotification.bt_payload, false, true);
        done();
      } catch (err) {
        assert(false);
      }
    });

    it('should succeed with sample merchant account declined', async done => {
      try {
        const sampleNotification = Braintree.getGateway(false).webhookTesting.sampleNotification(
          braintree.WebhookNotification.Kind.SubMerchantAccountDeclined,
          'myId'
        );
        Braintree.parse(slackbot, sampleNotification.bt_signature, sampleNotification.bt_payload, false, true);
        done();
      } catch (err) {
        assert(false);
      }
    });
  });
});
