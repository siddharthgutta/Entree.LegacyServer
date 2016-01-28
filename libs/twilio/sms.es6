// importing from the config file which contains the keys
import {twilio_config, twilio_test_config} from './config';

// importing the twilio node module
var twilio = require('twilio');
var Promise = require("bluebird");

var administratorPhoneNumbers = require("./config/administrators.json");
var twilioNumber = require("./config/twilio_numbers.json")[0];

// Creating twilio clients for production and test
var twilioProductionClient = twilio(twilio_config.accountSid, twilio_config.authToken);
var twilioTestClient = twilio(twilio_test_config.accountSid, twilio_test_config.authToken);

class TwilioSMSSendClient {
  constructor(client, fromNumber) {
    this.twilioClient = client;
    this.fromNumber = fromNumber;
  }

  sendSMS(toNumber, textBody, fromNumber=this.fromNumber) {
    this.twilioClient.sendMessage({
      to: toNumber,
      from: fromNumber,
      body: textBody
    })
  }
}

class TwilioSMSSendAdministratorsClient extends TwilioSMSSendProductionClient {
  constructor(initialFromNumber) {
    super(initialFromNumber);
  }

  sendServerNotification(textBody) {
      console.tag("Twilio", "SMS", "Send", "Server Notification").log("Sending the following message to admins: " + textBody);
      administratorPhoneNumbers.forEach(({phoneNumber, name}) => {
          sendSMS(phoneNumber, "Hi " + name + ", " + textBody);
      });
  }
}

class TwilioSMSSendProductionClient extends TwilioSMSSendClient {
  constructor(initalFromNumber) {
    super(twilioProductionClient, initialFromNumber);
  }
}

class TwilioSMSSendTestClient extends TwilioSMSSendClient {
  constructor(initalFromNumber) {
    super(twilioTestClient, initalFromNumber);
  }
}

function sendSMS(toNumber, fromNumber, textBody, specificTwilioClient) {
  specificTwilioClient.sendMessage({
    to: toNumber,
    from: fromNumber,
    body: textBody

    //this function is executed when a response is received from Twilio
  }, function (error, responseData) {
    // "err" is an error received during the request, if any
    if (!error) {

      // "responseData" is a JavaScript object containing data received from Twilio.
      // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
      // http://www.twilio.com/docs/api/rest/sending-sms#example-1
      console.log(responseData.from + ":" + responseData.body);

    } else {
      console.log(JSON.stringify(error) + "\n" + responseData);
    }
  })
}

export function sendStandardSMS(toNumber, textBody) {
  console.tag("sendStandardSMS").log(arguments);
  sendSMS(toNumber, twilio_config.sendingNumber, textBody, twilioClient);
}

export function sendTestSMS(toNumber, textBody) {
  console.tag("sendTestSMS").log(arguments);
  sendSMS(toNumber, twilio_test_config.sendingNumber, textBody, twilioTestClient);
}
