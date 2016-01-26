import {Router} from 'express';
import bodyParser from 'body-parser'
import {twilio_config, twilio_test_config} from '../libs/twilio/config';

var twilio = require('twilio');

const route = Router();

// Specific middleware for the twilio router
route.use((req, res, next)=> {
  res.header('Access-Control-Allow-Origin', '*');
  res.ok = (data, message) => res.json({status: 0, data: data.toJSON ? data.toJSON() : data, message});
  res.fail = (cause, message, status) => res.json({status: status || 1, cause, message});
  next();
});

// Receiving a text message from a user transferred by Twilio
route.post('/receive', (req, res) => {
  // Twilio received a real text message
  if (twilio.validateExpressRequest(req, twilio_config.authToken)) {
<<<<<<< HEAD
    console.tag("Twilio", "SMS", "Receive", "Production").log("Real text message received\n" + JSON.stringify(req));
    var resp = new twilio.TwimlResponse();
        resp.say('express sez - hello twilio!');
=======
    console.log("Twilio: received a real text message\n" + JSON.stringify(req));
    var resp = new twilio.TwimlResponse();
        resp.say('express sez - hello twilio!');

>>>>>>> added basic routing for the twilio POST endpoints that twilio will hit when we receive a text message
        res.type('text/xml');
        res.send(resp.toString());
  }
  // Someone besides Twilio is attempting to use this endpoint
  else {
    res.status(401).send("Sorry, you are not authorized to make requests here.");
  }
});

// Receiving a text message from a user transferred by Twilio
route.post('/testreceive', (req, res) => {
  // Twilio received a real test message
  if (twilio.validateExpressRequest(req, twilio_test_config.authToken)) {
<<<<<<< HEAD
    console.tag("Twilio", "SMS", "Receive", "Test").log("Test text message received\n" + JSON.stringify(req));
=======
    console.log("Twilio: received a test text message\n" + JSON.stringify(req));
>>>>>>> added basic routing for the twilio POST endpoints that twilio will hit when we receive a text message
    var resp = new twilio.TwimlResponse();
        resp.say('express sez - hello twilio!');

        res.type('text/xml');
        res.send(resp.toString());
  }
  // Someone besides Twilio is attempting to use this endpoint
  else {
    res.status(401).send("Sorry, you are not authorized to make requests here.");
  }
});

export default route;
