import {sendStandardSMS, sendTestSMS} from "../libs/twilio/sms";
import expect from 'expect.js'

describe('Twilio Send', ()=> {
  it('using test SMS should work successfully', done => {
    sendTestSMS("2149664948", "This is a test message to be sent to a using the test credentials to a phone number.");
  });
});
