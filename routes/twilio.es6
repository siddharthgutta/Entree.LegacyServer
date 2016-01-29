import {Router} from 'express';
import bodyParser from 'body-parser'
import config from 'config'
var twilio = require('twilio');
const productionCreds = config.get('Twilio.production');
const testCreds = config.get('Twilio.test');

const route = Router();

// Receiving a text message from a user transferred by Twilio
route.post('/receive', (req, res) => {
  // Twilio received a real text message
  if (twilio.validateExpressRequest(req, productionCreds.authToken)) {
    console.tag("routes", "twilio", "production").log("Text message received\n" + JSON.stringify(req));

    var resp = new twilio.TwimlResponse();
        /*
        Insert code to respond with appropriate response message using a similaar format
        */
        resp.message('We have received your message!');
        res.type('text/plain');
        res.send(resp.toString());
  // if we receive a test message
  } else if (twilio.validateExpressRequest(req, testCreds.authToken)) {
    console.tag("routes", "twilio", "test").log("Text message received\n" + JSON.stringify(req));
    var resp = new twilio.TwimlResponse();
        /*
        Insert code to respond with appropriate response message using a similaar format
        */
        resp.message('We have received your test message!');
        res.type('text/plain');
        res.send(resp.toString());
  }
  // Someone besides Twilio is attempting to use this endpoint
  else {
    res.status(401).send("Sorry, you are not authorized to make requests here.");
  }
});


export default route;
