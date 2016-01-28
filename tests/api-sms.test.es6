import './test-init.es6'
import {send, broadcast} from "../api/sms.es6";
import expect from 'expect.js'
import moment from 'moment'
import _ from 'underscore'
import Promise from 'bluebird'

const tests = {
  FROM_INVALID_NUMBER: {num: "+15005550001", "message": "should give error code 21212 [Invalid 'From' Phone Number]"},
  FROM_UNKNOWNED_PHONE_NUMBER: {
    num: "+15005550007",
    "message": "should give error 21602 [The 'From' phone number provided is not a valid, message-capable Twilio phone number.]"
  },
  FROM_FULL_MESSAGE_QUEUE_NUMBER: {
    num: "+15005550008",
    "message": "should give error 21611 [This 'From' number has exceeded the maximum number of queued messages]"
  },
  FROM_VALID_NUMBER: {num: "+15005550006", "message": "should give no error"},

  TO_INVALID_NUMBER: {num: "+15005550001", "message": "should give error code 21211 [Invalid 'To' Phone Number]"},
  TO_CANNOT_ROUTE_NUMBER: {
    num: "+15005550002",
    "message": "should give error code 21612 [The 'To' phone number is not currently reachable via SMS or MMS]"
  },
  TO_NO_INTERNATIONAL_PERMISSIONS: {
    num: "+15005550003",
    "message": "should give error 21408 [Permission to send an SMS has not been enabled for the region indicated by the 'To' number]"
  },
  TO_BLACKLISTED_NUMBER: {
    num: "+15005550004",
    "message": "should give error 21610 [Message cannot be sent to the 'To' number because the customer has replied with STOP]"
  },
  TO_INCAPABLE_OF_RECEIVING_SMS: {
    num: "+15005550009",
    "message": "should give error 21614 ['To' number is not a valid mobile number]"
  },
  TO_VALID_NUMBER: {num: "+15005551000", "message": "should be a valid number"}
};

describe('Twilio Send ', ()=> {
  it('using test SMS should work successfully', done => {
    send("7135011837", `TEST SMS ${moment().format("h:mm A")}`)
        .then(()=> done())
        .catch(err => {
          console.tag(TEST).error(err);
          done(err);
        });
  });

  _.map(tests, test => {
    it(test.message, done => {
      send(test.to, `TEST SMS ${moment().format("h:mm A")}`)
          .then(()=> done())
          .catch(err => {
            console.tag(TEST).error(err);
            done(err);
          });
    });
  });
});
