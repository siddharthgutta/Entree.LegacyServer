import {Router} from 'express';
import Twilio from 'twilio';
import bodyParser from 'body-parser';
import PubSub from '../pubsub.es6';
import config from 'config';

const twilio = config.get('Twilio');
const client = new Twilio(twilio.sid, twilio.token);
const route = new Router();

route.use(bodyParser.urlencoded({extended: true}));

PubSub.Slave.on('twilio-send', async (origin, data, respond) => {
  try {
    data.from = twilio.number;
    const receipt = await client.sendMessage(data);
    respond(receipt);
    PubSub.Slave.broadcast('twilio-sent', {origin, receipt}, origin); // EXCEPT origin
  } catch (e) {
    respond(e);
  }
});

PubSub.Slave.on('twilio-number', async (origin, data, respond) => {
  respond(twilio.number);
});

route.post('/sms', Twilio.webhook(), (req, res) => {
  PubSub.Slave.broadcast('twilio-received', req.body);
  res.set('Content-Type', 'text/xml');
  res.send('<Response></Response>');
});

route.post('/fallback', Twilio.webhook({validate: false}), (req, res) => {
  PubSub.Slave.broadcast('twilio-received', req.body);
  res.set('Content-Type', 'text/xml');
  res.send('<Response></Response>');
});

export default route;
