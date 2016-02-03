/**
 * Created by kfu on 2/2/16.
 */

import './test-init.es6';
import expect from 'expect.js';
import supertest from 'supertest';
import {isEmpty} from '../libs/utils.es6';
import {resolveContext} from '../bootstrap.es6';
import {parseString} from 'xml2js';
import selectn from 'selectn';

const port = resolveContext().port;
const server = supertest.agent(`http://localhost:${port}`);

const REAL_RECEIVE_BODY = {ToCountry: 'US', ToState: 'TX', SmsMessageSid: 'SMa7934e2ae401ac3af943b9135ac2b970',
  NumMedia: '0', ToCity: 'MILANO', FromZip: '75052', SmsSid: 'SMa7934e2ae401ac3af943b9135ac2b970', FromState: 'TX',
  SmsStatus: 'received', FromCity: 'GRAND PRAIRIE', Body: 'Abc', FromCountry: 'US', To: '+15125200133',
  ToZip: '76556', NumSegments: '1', MessageSid: 'SMa7934e2ae401ac3af943b9135ac2b970',
  AccountSid: 'AC98c288dd56d31217abb621f81b1415e4', From: '+12149664948', ApiVersion: '2010-04-01'};

const TWILIO_SIGNATURE = {key: 'x-twilio-signature', value: '7vATkqm2GnYiJXXeViUaas62WXc='};

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
    it('should pass validation for complex post request', done => {
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
            } else if (isEmpty(selectn('Response.Message', result)[0])) {
              console.tag(global.TEST).log('Message Response is empty!');
              expect().fail('Could not get message response');
            }
          });
          done();
        });
    });

    it('should pass validation for simple post request', done => {
      server
        .post(`/twilio/fallback`)
        .send({})
        .expect('Content-type', 'text/xml; charset=utf-8')
        .expect(200)
        .end((err, res) => {
          if (err) {
            // If expected error occurs, test is good
            console.tag(global.TEST).log(err);
            expect().fail('Error response returned: MAY NEED TO MODIFY THIS TEST');
          }

          // Checks the XML message text
          parseString(res.res.text, (xmlError, result) => {
            if (xmlError) {
              console.tag(global.TEST).log(xmlError);
              expect().fail('Could not parse XML: MAY NEED TO MODIFY THIS TES');
            } else if (isEmpty(selectn('Response.Message', result)[0])) {
              console.tag(global.TEST).log('Message Response is empty!');
              expect().fail('Could not get message response: MAY NEED TO MODIFY THIS TES');
            }
          });
          done();
        });
    });
  });
});
