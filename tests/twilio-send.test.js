import {sendStandardSMS, sendTestSMS} from "../libs/twilio/sms";
import expect from 'expect.js'
import {initScribe} from '../bootstrap'
import moment from 'moment';

const console = initScribe(true); // set to true

console.tag(__filename).log("Starting tests");

describe('Twilio Send', ()=> {
  it('using test SMS should work successfully', done => {
<<<<<<< HEAD
<<<<<<< HEAD
    sendTestSMS("2149664948", "This is a test message to be sent to a using the test credentials to a phone number.");
=======
    const txt = "TEST SMS " + moment().format("h:mm A");
    expect(sendTestSMS).withArgs("2149664948", txt).to.not.throwException();
    done();
>>>>>>> Fixing tests
=======
    const txt = "TEST SMS " + moment().format("h:mm A");
    expect(sendTestSMS).withArgs("2149664948", txt).to.not.throwException();
    done();
>>>>>>> 3af0a2065caa84c8895c5299585eef8081f1a8c6
  });
});
