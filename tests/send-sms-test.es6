import './test-init.es6';
import {sendSMS, broadcast} from '../api/sms.es6';
import expect from 'expect.js';
import moment from 'moment';
import _ from 'underscore';
import Twilio from '../libs/sms/twilio.es6';
import config from 'config';
const testCreds = config.get('Twilio.test');
const TWILIO_FROM_NUMBER = config.get('Twilio.numbers')[0];
const admins = config.get('Admins');

// SET THIS VARIABLE FOR VERBOSE LOGS OF ALL REQUESTS/RESPONSES
const VERBOSE_LOGGING = false;

const TO_TEST_NUMS = {
  TO_INVALID_NUMBER: {
    num: '+15005550001',
    message: "should give error code 21211 [Invalid 'To' Phone Number]",
    error: true
  },
  TO_CANNOT_ROUTE_NUMBER: {
    num: '+15005550002',
    message: "should give error code 21612 [The 'To' phone number is not currently reachable via SMS or MMS]",
    error: true
  },
  TO_NO_INTERNATIONAL_PERMISSIONS: {
    num: '+15005550003',
    message: 'should give error 21408 ' +
    "[Permission to send an SMS has not been enabled for the region indicated by the 'To' number]",
    error: true
  },
  TO_BLACKLISTED_NUMBER: {
    num: '+15005550004',
    message: 'should give error 21610 ' +
    "[Message cannot be sent to the 'To' number because the customer has replied with STOP]",
    error: true
  },
  TO_INCAPABLE_OF_RECEIVING_SMS: {
    num: '+15005550009',
    message: "should give error 21614 ['To' number is not a valid mobile number]",
    error: true
  },
  TO_VALID_NUMBER: {
    num: '+15005551000',
    message: 'should be a valid number',
    error: false
  }
};

const FROM_TEST_NUMS = {
  FROM_INVALID_NUMBER: {
    num: '+15005550001',
    message: 'should give error code 21212 ' +
    "[Invalid 'From' Phone Number]",
    error: true
  },
  FROM_UNKNOWNED_PHONE_NUMBER: {
    num: '+15005550007',
    message: 'should give error 21602 ' +
    "[The 'From' phone number provided is not a valid, message-capable Twilio phone number.]",
    error: true
  },
  FROM_FULL_MESSAGE_QUEUE_NUMBER: {
    num: '+15005550008',
    message: 'should give error 21611 ' +
    "[This 'From' number has exceeded the maximum number of queued messages]",
    error: true
  },
  FROM_VALID_NUMBER: {
    num: '+15005550006',
    message: 'should give no error',
    error: false
  }
};

const testSMS = new Twilio(FROM_TEST_NUMS.FROM_VALID_NUMBER.num, testCreds.sid, testCreds.authToken);

function sendTestSMS(toNumber, textBody, verboseLogging = VERBOSE_LOGGING) {
  if (verboseLogging) {
    console.tag('api', 'sms', 'test')
           .log(toNumber, textBody);
  }

  return testSMS.send(toNumber, textBody, VERBOSE_LOGGING);
}

function checkError(expectedError, resultingError, responseOrErrorObject, verboseLogging = VERBOSE_LOGGING) {
  if (expectedError !== resultingError) {
    console.tag(global.TEST)
           .err(responseOrErrorObject);
  } else if (verboseLogging) {
    console.tag(global.TEST)
           .log(responseOrErrorObject);
  }
}

describe('Twilio Send', () => {
  describe('To', () => {
    /*
     Only set REAL_SMS_TEST or BROADCAST_REAL_SMS_TEST or to true when wanting to test real text messages
     Immediately set it to false when done testing
     Disclaimer: Twilio will charge us for these!
     */
    const REAL_SMS_TEST = false;
    // Modify this number, to test with your own phone
    const REAL_PHONE_NUMBER_WITHOUT_COUNTRY_CODE = '2149664948';
    const REAL_PHONE_NUMBER = `+1${REAL_PHONE_NUMBER_WITHOUT_COUNTRY_CODE}`;
    const BROADCAST_REAL_SMS_TEST = false;
    const REAL_NUMBERS = [REAL_PHONE_NUMBER_WITHOUT_COUNTRY_CODE, REAL_PHONE_NUMBER];


    if (REAL_SMS_TEST) {
      _.map(REAL_NUMBERS, number => {
        it('sending real SMS to number with country code should send successfully', done => {
          const testMessage = `TEST SMS ${moment()
          .format('h:mm A')}`;
          sendSMS(number, testMessage)
          .then(response => {
            console.tag(global.TEST)
                   .log(`Real SMS response: ${JSON.stringify(response)}`);
            expect(response.to)
            .to
            .be(REAL_PHONE_NUMBER);
            expect(response.from)
            .to
            .be(TWILIO_FROM_NUMBER);
            expect(response.body)
            .to
            .contain(`${testMessage}`);
            done();
          })
          .catch(err => {
            console.tag(global.TEST)
                   .error(err);
            expect()
            .fail('Text message was not sent successfully even though it should have!');
            done();
          });
        });
      });

      it('should fail to send real SMS with invalid number', done => {
        sendSMS('+123', `TEST SMS ${moment()
        .format('h:mm A')}`)
        .then(response => {
          console.tag(global.TEST)
                 .log(`Real SMS response: ${JSON.stringify(response)}`);
          expect()
          .fail('Text message should not be sent successfully with invalid number!');
          done();
        })
        .catch(err => {
          console.tag(global.TEST)
                 .error(err);
          done();
        });
      });
    }

    if (BROADCAST_REAL_SMS_TEST) {
      it('broadcasting real SMS to admins should work successfully', done => {
        broadcast(`BROADCAST TEST SMS ${moment()
        .format('h:mm A')}`, admins)
        .then(responses => {
          responses.forEach(response => {
            console.tag(global.TEST)
                   .log(`Broadcast response: ${JSON.stringify(response)}`);
          });
          done();
        })
        .catch(err => {
          console.tag(global.TEST)
                 .error(err);
          expect()
          .fail('A text message was not sent successfully even though it should have!');
          done();
        });
      });
    }

    _.map(TO_TEST_NUMS, test => {
      it(test.message, done => {
        sendTestSMS(test.num, `TEST SMS ${moment()
        .format('h:mm A')}`)
        .then(response => {
          checkError(test.error, false, response);
          expect(test.error)
          .to
          .be(false);
          done();
        })
        .catch(err => {
          checkError(test.error, true, err);
          expect(test.error)
          .to
          .be(true);
          done();
        });
      });
    });
  });

  describe('From', () => {
    const validToNumber = TO_TEST_NUMS.TO_VALID_NUMBER.num;

    _.map(FROM_TEST_NUMS, test => {
      it(test.message, done => {
        testSMS.changeFromNumber(test.num);
        sendTestSMS(validToNumber, `TEST SMS ${moment()
        .format('h:mm A')}`)
        .then(response => {
          checkError(test.error, false, response);
          expect(test.error)
          .to
          .be(false);
          done();
        })
        .catch(err => {
          checkError(test.error, true, err);
          expect(test.error)
          .to
          .be(true);
          done();
        });
      });
    });
  });
});
