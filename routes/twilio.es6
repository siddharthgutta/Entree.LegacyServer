import {Router} from 'express';
import config from 'config';
const twilio = require('twilio');
const productionCreds = config.get('Twilio.production');
const testCreds = config.get('Twilio.test');

const route = new Router();

process.env.TWILIO_AUTH_TOKEN = testCreds.authToken;

// Receiving a text message from a user transferred by Twilio
route.post('/receive', twilio.webhook(), (req, res) => {
  // Twilio received a real text message
  console.log(process.env.TWILIO_AUTH_TOKEN);
  let resp;
  //if (twilio.validateExpressRequest(req, productionCreds.authToken)) {
  console.log(twilio.validateExpressRequest(req, productionCreds.authToken));
    console.tag('routes', 'twilio', 'production').log('Text message received: ${JSON.stringify(req)}');
    console.log(`Request: ${JSON.stringify(req.body)}`);
    resp = new twilio.TwimlResponse();
    /*
    Insert code to respond with appropriate response message using a similaar format
    */
    resp.message('We have received your message!');
    res.type('text/xml');
    res.send(resp.toString());
  //} else if (twilio.validateExpressRequest(req, testCreds.authToken)) {
  //  // if we receive a test message
  //  console.log(`Test Request: ${JSON.stringify(req.body)}`);
  //  console.tag('routes', 'twilio', 'test').log('Text message received: ${JSON.stringify(req)}');
  //  resp = new twilio.TwimlResponse();
  //  /*
  //  Insert code to respond with appropriate response message using a similaar format
  //  */
  //  resp.message('We have received your test message!');
  //  res.type('text/xml');
  //  res.send(resp.toString());
  //} else {
  //  // Someone besides Twilio is attempting to use this endpoint
  //  console.log(`Error: ${JSON.stringify(req.body)}`);
  //  res.status(403).send('Sorry, you are not authorized to make requests here.');
  //}
});

export default route;
