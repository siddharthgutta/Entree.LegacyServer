import {sendStandardSMS, sendTestSMS} from "../libs/twilio/sms";
import expect from 'expect.js'
import {initScribe} from '../bootstrap'
import moment from 'moment';

const console = initScribe(true, false, false); // set to true

// These are test numbers that can be used as from phone numbers
const FROM_INVALID_NUMBER = "+15005550001";  // should give error code 21212 [Invalid 'From' Phone Number]
const FROM_UNKNOWNED_PHONE_NUMBER = "+15005550007"; // should give error 21602 [The 'From' phone number provided is not a valid, message-capable Twilio phone number.]
const FROM_FULL_MESSAGE_QUEUE_NUMBER = "+15005550008" // should give error 21611 [This 'From' number has exceeded the maximum number of queued messages]
const FROM_VALID_NUMBER = "+15005550006"; // should give no error

// These are test numbers that can be used as to phone numbers
const TO_INVALID_NUMBER = "+15005550001"; // should give error code 21211 [Invalid 'To' Phone Number]
const TO_CANNOT_ROUTE_NUMBER = "+15005550002"; // should give error code 21612 [The 'To' phone number is not currently reachable via SMS or MMS]
const TO_NO_INTERNATIONAL_PERMISSIONS = "+15005550003"; // should give error 21408 [Permission to send an SMS has not been enabled for the region indicated by the 'To' number]
const TO_BLACKLISTED_NUMBER = "+15005550004"; // should give error 21610 [Message cannot be sent to the 'To' number because the customer has replied with STOP]
const TO_INCAPABLE_OF_RECEIVING_SMS = "+15005550009"; // should give error 21614 ['To' number is not a valid mobile number]
const TO_VALID_NUMBER = "+15005551000"; // should be a valid number

console.tag(__filename).log("Starting Twilio Send Tests");

describe('Twilio Send ', ()=> {
  it('using test SMS should work successfully', done => {
    const txt = "TEST SMS " + moment().format("h:mm A");
    expect(sendTestSMS).withArgs("2149664948", txt).to.not.throwException();
    done();
  });
});

// process.stdout.write("YOLO-FORCE")
