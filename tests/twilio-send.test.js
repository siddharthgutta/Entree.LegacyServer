import {sendStandardSMS, sendTestSMS} from "../libs/twilio/sms";
import expect from 'expect.js'
import {initScribe} from '../bootstrap'
import moment from 'moment';

const console = initScribe(true); // set to true

console.tag(__filename).log("Starting tests");

describe('Twilio Send', ()=> {
  it('using test SMS should work successfully', done => {
    const txt = "TEST SMS " + moment().format("h:mm A");
    expect(sendTestSMS).withArgs("2149664948", txt).to.not.throwException();
    done();
  });
});
