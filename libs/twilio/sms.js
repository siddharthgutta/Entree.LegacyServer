// importing from the config file which contains the keys
import {twilio_config, twilio_test_config} from './config';

// importing the twilio node module
var twilio  = require('twilio');

// Creating twilio clients for production and test
var twilioClient = twilio(twilio_config.accountSid, twilio_config.authToken);
var twilioTestClient = twilio(twilio_test_config.accountSid, twilio_test_config.authToken);

function sendSMS(toNumber, fromNumber, textBody, specificTwilioClient) {
  specificTwilioClient.sendMessage({
    to: toNumber,
    from: fromNumber,
    body: textBody

  //this function is executed when a response is received from Twilio
  }, function(error, responseData) {
    // "err" is an error received during the request, if any
    if (!error) {

      // "responseData" is a JavaScript object containing data received from Twilio.
      // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
      // http://www.twilio.com/docs/api/rest/sending-sms#example-1
      console.log(responseData.from + ":" + responseData.body);

    }
  })
}

var sendStandardSMS = (toNumber, textBody) => {
  sendSMS(toNumber, twilio_config.sendingNumber, textBody, twilioClient);
}

var sendTestSMS = (toNumber, textBody) => {
  sendSMS(toNumber, twilio_test_config.sendingNumber, textBody, twilioTestClient);
}
