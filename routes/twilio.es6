import {Router} from 'express';
import config from 'config';
const twilio = require('twilio');
const productionCreds = config.get('Twilio.production');
const route = new Router();

process.env.TWILIO_AUTH_TOKEN = productionCreds.authToken;

function respond(res, message) {
  const resp = new twilio.TwimlResponse();
  resp.message(message);
  res.type('text/xml');
  res.send(resp.toString());
}

// Receiving a text message from a user transferred by Twilio
route.post('/receive', twilio.webhook(), (req, res) => {
  // The commented out functions are useful for writing unit tests if this route changes
  /*
  console.log(`Accepts application/json: ${req.accepts('application/json')}`);
  console.log(`Request Headers: ${JSON.stringify(req.headers)}`);
  */
  // Make sure to use Twilio.normalize to convert number to 10 digit
  console.tag('routes', 'twilio', 'receive').log(`Request: ${JSON.stringify(req.body)}`);

  /*
   !!!!! Set message to the corresponding function calls for handling appropriate responses
   */
  const message = 'Receive: We have received your message!';
  respond(res, message);
});

// Receiving a fallback text message from a user transferred by Twilio when /receive fails
route.post('/fallback', twilio.webhook({
  // Turning off standard validation
  validate: false
}), (req, res) => {
  // Make sure to use Twilio.normalize to convert number to 10 digit
  console.tag('routes', 'twilio', 'fallback').log(`Request: ${JSON.stringify(req.body)}`);
  /*
   !!!!! Set message to the corresponding function calls for handling appropriate responses
   NOTE: we might implement something different for this case because this may occur when validation fails
   */
  const message = 'Fallback: We have received your message!';
  respond(res, message);
});

export default route;
