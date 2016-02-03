import {Router} from 'express';
import config from 'config';
const twilio = require('twilio');
const productionCreds = config.get('Twilio.production');
const route = new Router();

process.env.TWILIO_AUTH_TOKEN = productionCreds.authToken;

// Receiving a text message from a user transferred by Twilio
route.post('/receive', twilio.webhook(), (req, res) => {
  // Twilio received a real text message
  const resp = new twilio.TwimlResponse();

  console.tag('routes', 'twilio', 'receive').log(`Request: ${JSON.stringify(req.body)}`);
  /*
  !!!!! Set responseMessage to the corresponding function calls for handling appropriate responses
  */
  const responseMessage = 'We have received your message!';
  resp.message(responseMessage);
  res.type('text/xml');
  res.send(resp.toString());
});

route.post('/fallback', twilio.webhook({
  validate: false
}), (req, res) => {
  const resp = new twilio.TwimlResponse();

  console.tag('routes', 'twilio', 'fallback').log(`Request: ${JSON.stringify(req.body)}`);
  /*
   !!!!! Set responseMessage to the corresponding function calls for handling appropriate responses
   NOTE: we might implement something different for this case because this may occur when validation fails
   */
  const responseMessage = 'We have received your message!';
  resp.message(responseMessage);
  res.type('text/xml');
  res.send(resp.toString());
});

export default route;
