import {Router} from 'express';
import config from 'config';
const twilio = require('twilio');
const productionCreds = config.get('Twilio.production');
const route = new Router();
import {create} from '../api/message.es6';
import socketServer from '../message/socket-server.es6';
import {findOne} from '../api/socketToken.es6';
import Promise from 'bluebird';

process.env.TWILIO_AUTH_TOKEN = productionCreds.authToken;

function respond(res, message) {
  const resp = new twilio.TwimlResponse();
  resp.message(message);
  res.type('text/xml');
  res.send(resp.toString());
}

function normalize(toNumber) {
  return `${String(toNumber).replace('+1', '')}`;
}

route.use((req, res, next) => {
  res.ok = (tags, logMessage, data, resMessage, status = 0) => {
    console.tag(...tags).log(logMessage);
    res.json({status, message: resMessage, data: data && data.toJSON ? data.toJSON() : data});
  };
  res.fail = (tags, logMessage, resMessage, status = 1) => {
    console.tag(...tags).error(logMessage);
    res.json({status, message: resMessage});
  };
  next();
});

/**
 * Finds all messages between associated with phoneNumber ordered by date
 *
 * @param {String} from: phone number of the user who sent the message to the Twilio number
 * @param {Number} restaurantID: restaurantID for messages/socketTokens
 * @param {String} textBody: body of the message
 * @param {Number} date: timestamp of when the message was sent
 * @param {String} msgSid: Twilio message Sid unique id
 * @param {String} twilioNumber: Twilio number message was sent to
 * @param {Boolean} sent: whether or not the message was sent by the end user or not
 * @param {Boolean} success: whether or not the message was sent successfully via Twilio
 * @returns {Promise}: Returns an object that contains the row of that restaurantID
 */
export function createAndEmit(from, restaurantID, textBody, date, msgSid, twilioNumber, sent, success) {
  return new Promise((resolve, reject) => {
    create(from, restaurantID, textBody, date, msgSid, twilioNumber, sent, success).then(message => {
      findOne(restaurantID).then(result => {
        console.log(`Emiiting receive message to the following tokens: ${result.tokens}`);
        result.tokens.forEach(token => {
          socketServer.emit(token, 'receive', {from, textBody, date, sent}, false);
        });
        resolve(message);
      }).catch(findOneError => {
        reject(findOneError);
      });
    }).catch(createError => {
      reject(createError);
    });
  });
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
  // NEEDS TO BE REPLACED WITH USER AUTHENTICATION
  // 0 for now for Sid's Messenger
  createAndEmit(normalize(req.body.From), 0, req.body.Body,
      Date.now(), req.body.SmsMessageSid, normalize(req.body.To), true, true).then(() => {
        console.tag('routes', 'twilio', 'receive').log('Successfully created/emitted message');
        respond(res, '');
      }).catch(err => {
        res.status(500).fail(['routes', 'twilio', 'receive'], err,
          'There was an error receiving this message.');
      });
});

// Receiving a fallback text message from a user transferred by Twilio when /receive fails
route.post('/fallback', twilio.webhook({
  // Turning off standard validation
  validate: false
}), (req, res) => {
  // Make sure to use Twilio.normalize to convert number to 10 digit
  console.tag('routes', 'twilio', 'fallback').log(`Request: ${JSON.stringify(req.body)}`);
  // NEEDS TO BE REPLACED WITH USER AUTHENTICATION
  // 0 for now for Sid's Messenger
  createAndEmit(normalize(req.body.From), 0, req.body.Body,
      Date.now(), req.body.SmsMessageSid, normalize(req.body.To), true, true).then(() => {
        console.tag('routes', 'twilio', 'fallback').log('Successfully created/emitted message');
        respond(res, '');
      }).catch(err => {
        res.status(500).fail(['routes', 'twilio', 'fallback'], err,
          'There was an error receiving this message.');
      });
});
export default route;
