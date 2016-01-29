import './test-init.es6'
import {sendSMS, broadcast} from "../api/sms.es6";
import expect from 'expect.js'
import moment from 'moment'
import _ from 'underscore'
import Promise from 'bluebird'
import Twilio from '../libs/sms/twilio.es6'
import config from 'config'
const testCreds = config.get('Twilio.test');

const to_test_nums = {


    TO_INVALID_NUMBER: {
        num: "+15005550001",
        "message": "should give error code 21211 [Invalid 'To' Phone Number]",
        "error": true
    },
    TO_CANNOT_ROUTE_NUMBER: {
        num: "+15005550002",
        "message": "should give error code 21612 [The 'To' phone number is not currently reachable via SMS or MMS]",
        "error": true

    },
    TO_NO_INTERNATIONAL_PERMISSIONS: {
        num: "+15005550003",
        "message": "should give error 21408 [Permission to send an SMS has not been enabled for the region indicated by the 'To' number]",
        "error": true

    },
    TO_BLACKLISTED_NUMBER: {
        num: "+15005550004",
        "message": "should give error 21610 [Message cannot be sent to the 'To' number because the customer has replied with STOP]",
        "error": true

    },
    TO_INCAPABLE_OF_RECEIVING_SMS: {
        num: "+15005550009",
        "message": "should give error 21614 ['To' number is not a valid mobile number]",
        "error": true

    },
    TO_VALID_NUMBER: {
        num: "+15005551000",
        "message": "should be a valid number",
        "error": false

    }
};

const from_test_nums = {
    FROM_INVALID_NUMBER: {
        num: "+15005550001",
        "message": "should give error code 21212 [Invalid 'From' Phone Number]",
        "error": true
    },
    FROM_UNKNOWNED_PHONE_NUMBER: {
        num: "+15005550007",
        "message": "should give error 21602 [The 'From' phone number provided is not a valid, message-capable Twilio phone number.]",
        "error": true
    },
    FROM_FULL_MESSAGE_QUEUE_NUMBER: {
        num: "+15005550008",
        "message": "should give error 21611 [This 'From' number has exceeded the maximum number of queued messages]",
        "error": true

    },
    FROM_VALID_NUMBER: {
        num: "+15005550006",
        "message": "should give no error",
        "error": false

    }
}

const testSMS = new Twilio(from_test_nums.FROM_VALID_NUMBER.num, testCreds.sid, testCreds.authToken);

function sendTestSMS(toNumber, textBody) {
    console.tag('api', 'sms', 'test').log(toNumber, textBody);
    return testSMS.send(toNumber, textBody);
}

describe("TwilioSend", () => {
    describe('To', ()=> {

        // Only uncomment this test when wanting to test real text messages
        // Disclaimer: Twilio will charge us for these!

         //it('using test SMS should work successfully', done => {
         //    sendSMS("+12149664948", `TEST SMS ${moment().format("h:mm A")}`)
         //        .then((response)=> {
         //        console.tag(TEST).log(response);
         //        done();
         //    })
         //    .catch(err => {
         //        console.tag(TEST).error(err);
         //        expect().fail("Text message was not sent successfully even though it should have!");
         //        done();
         //    });
         //});


        _.map(to_test_nums, test => {
            it(test.message, done => {
                sendTestSMS(test.num, `TEST SMS ${moment().format("h:mm A")}`)
                    .then((response)=> {
                        console.tag(TEST).log(response);
                        expect(test.error).to.be(false);
                        done();
                    })
                    .catch(err => {
                        console.tag(TEST).error(err);
                        expect(test.error).to.be(true);
                        done();
                    });
            });
        });
    });

    describe('From', () => {

        var valid_to_number = to_test_nums.TO_VALID_NUMBER.num;

        _.map(from_test_nums, test => {
            it(test.message, done => {
                testSMS.changeFromNumber(test.num);
                sendTestSMS(valid_to_number, `TEST SMS ${moment().format("h:mm A")}`)
                    .then((response) => {
                        console.tag(TEST).log(response);
                        expect(test.error).to.be(false);
                        done();
                    })
                    .catch(err => {
                        console.tag(TEST).error(err);
                        expect(test.error).to.be(true);
                        done();
                    });
            });
        });
    });
});
