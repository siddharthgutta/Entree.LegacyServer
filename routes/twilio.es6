import {Router} from 'express';
import {SMS} from '../api/controllers/sms.es6';
import {Twilio} from '../libs/sms/index.es6';

const route = new Router();

if (SMS instanceof Twilio) {
  route.use(SMS.router());
}

export default route;
