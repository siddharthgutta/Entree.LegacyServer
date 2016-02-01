import {Router} from 'express';
import config from 'config';
const twilio = require('twilio');
const productionCreds = config.get('Twilio.production');
const testCreds = config.get('Twilio.test');

const route = new Router();

// Receiving a text message from a user transferred by Twilio
route.post('/receive', (req, res) => {
  // Twilio received a real text message
  let resp;
  if (twilio.validateExpressRequest(req, productionCreds.authToken)) {
    console.tag('routes', 'twilio', 'production').log('Text message received: ${JSON.stringify(req)}');

    resp = new twilio.TwimlResponse();
    /*
    Insert code to respond with appropriate response message using a similaar format
    */
    resp.message('We have received your message!');
    res.type('text/plain');
    res.send(resp.toString());
  } else if (twilio.validateExpressRequest(req, testCreds.authToken)) {
    // if we receive a test message

    console.tag('routes', 'twilio', 'test').log('Text message received: ${JSON.stringify(req)}');
    resp = new twilio.TwimlResponse();
    /*
    Insert code to respond with appropriate response message using a similaar format
    */
    resp.message('We have received your test message!');
    res.type('text/plain');
    res.send(resp.toString());
  } else {
    // Someone besides Twilio is attempting to use this endpoint
    res.status(401).send('Sorry, you are not authorized to make requests here.');
  }
});

export default route;
