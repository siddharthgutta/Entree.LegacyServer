/**
 * Created by kfu on 2/2/16.
 */

import './test-init.es6';
import expect from 'expect.js';
import supertest from 'supertest';
import {isNullOrUndefined} from '../libs/utils.es6';
import {parseString} from 'xml2js';
import selectn from 'selectn';
import config from 'config';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as SocketToken from '../api/socketToken.es6';
import assert from 'assert';
import {createAndEmit} from '../routes/twilio.es6';

const port = config.get('Server.port');
const server = supertest.agent(`https://localhost:${port}`);

const REAL_RECEIVE_BODY = {ToCountry: 'US', ToState: 'TX', SmsMessageSid: 'SMa7934e2ae401ac3af943b9135ac2b970',
  NumMedia: '0', ToCity: 'MILANO', FromZip: '75052', SmsSid: 'SMa7934e2ae401ac3af943b9135ac2b970', FromState: 'TX',
  SmsStatus: 'received', FromCity: 'GRAND PRAIRIE', Body: 'Abc', FromCountry: 'US', To: '+15125200133',
  ToZip: '76556', NumSegments: '1', MessageSid: 'SMa7934e2ae401ac3af943b9135ac2b970',
  AccountSid: 'AC98c288dd56d31217abb621f81b1415e4', From: '+12149664948', ApiVersion: '2010-04-01'};

const TWILIO_SIGNATURE = {key: 'x-twilio-signature', value: '7vATkqm2GnYiJXXeViUaas62WXc='};

after(() => disconnectDatabase());

describe('Twilio SMS Receive', () => {
  describe('/receive endpoint', () => {
    it('should fail validation for complex request', done => {
      server
        .post(`/twilio/receive`)
        .set(TWILIO_SIGNATURE.key, TWILIO_SIGNATURE.value)
        .send(REAL_RECEIVE_BODY)
        .expect('Content-type', 'text/plain; charset=utf-8')
        .expect(403, done);
    });

    it('should fail validation for simple request', done => {
      server
        .post(`/twilio/receive`)
        .send({})
        .expect('Content-type', 'text/plain; charset=utf-8')
        .expect(403, done);
    });
  });

  describe('/fallback endpoint', () => {
    beforeEach(done => {
      clearDatabase().then(() => done());
    });

    it('should fail when cannot find matching SocketToken', done => {
      server
        .post(`/twilio/fallback`)
        .set(TWILIO_SIGNATURE.key, TWILIO_SIGNATURE.value)
        .send(REAL_RECEIVE_BODY)
        .expect('Content-type', 'application/json; charset=utf-8')
        .expect(500, done);
    });


    it('should succeed when SocketToken exists', done => {
      SocketToken.addTokenOrCreate(0, '123456').then(() => {
        server
          .post(`/twilio/fallback`)
          .set(TWILIO_SIGNATURE.key, TWILIO_SIGNATURE.value)
          .send(REAL_RECEIVE_BODY)
          .expect('Content-type', 'text/xml; charset=utf-8')
          .expect(200)
          .end((err, res) => {
            if (err) {
              // If expected error occurs, test is good
              console.tag(global.TEST).log(err);
              expect().fail('Error response returned');
            }

            // Checks the XML message text
            parseString(res.res.text, (xmlError, result) => {
              if (xmlError) {
                console.tag(global.TEST).log(xmlError);
                expect().fail('Could not parse XML');
              } else if (isNullOrUndefined(selectn('Response.Message', result)[0])) {
                console.tag(global.TEST).log('Message Response is empty!');
                expect().fail('Could not get message response');
              }
            });
            done();
          });
      }).catch(err => {
        expect().fail(`Could not create SocketToken: ${err}`);
      });
    });
  });

  describe('createAndEmit tests', () => {
    const phoneNumber = '1234567890';
    const content = 'This is the message content';
    const restaurantId = 1;
    const date = Date.now();
    const twilioSid = 'abc123';
    const twilioNumber = '0987654321';
    const sentByUser = true;
    const success = true;

    beforeEach(done => {
      clearDatabase().then(() => done());
    });

    it('should fail without SocketToken', done => {
      createAndEmit(
        phoneNumber,
        restaurantId,
        content,
        date,
        twilioSid,
        twilioNumber,
        sentByUser,
        success).then(() => {
          expect().fail(`Should fail since no SocketToken exists.`);
        }).catch(() => {
          done();
        });
    });

    it('should succeed if SocketToken exists', done => {
      SocketToken.addTokenOrCreate(restaurantId, '123456').then(() => {
        createAndEmit(
          phoneNumber,
          restaurantId,
          content,
          date,
          twilioSid,
          twilioNumber,
          sentByUser,
          success).then(message => {
            assert.equal(message.phoneNumber, phoneNumber);
            assert.equal(message.restaurantId, restaurantId);
            assert.equal(message.content, content);
            assert.equal(message.date.getTime(), date);
            assert.equal(message.twilioSid, twilioSid);
            assert.equal(message.twilioNumber, twilioNumber);
            assert.equal(message.sentByUser, sentByUser);
            assert.equal(message.success, success);
            done();
          }).catch(() => {
            expect().fail(`Should succeed since SocketToken exists.`);
          });
      }).catch(() => {
        expect().fail(`Should succeed since SocketToken exists.`);
      });
    });
  });
});
