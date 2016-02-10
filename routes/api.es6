import {Router} from 'express';
import * as Token from '../api/token.es6';
import * as User from '../api/user.es6';
import {ip, isEmpty} from '../libs/utils.es6';

const route = new Router();

route.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.ok = (tags, logMessage, data, resMessage) => {
    console.tag(...tags).log(logMessage);
    res.json({data: data.toJSON ? data.toJSON() : data, message: resMessage});
  };
  res.fail = (tags, logMessage, resMessage, status = 1) => {
    console.tag(...tags).error(logMessage);
    res.json({status, message: resMessage});
  };
  next();
});

// token
route.post('/token/create', (req, res) => {
  const {username, password} = req.body;
  Token.create(username, password).then(res.ok).catch(res.fail);
});

route.get('/token/status', (req, res) => {
  const {token} = req.body;
  Token.status(token).then(res.ok).catch(res.fail);
});

route.post('/token/destroy', (req, res) => {
  const {token} = req.body;
  Token.destroy(token).then(res.ok).catch(res.fail);
});

// user
route.post('/user/create', (req, res) => {
  const {username, email, password, other} = req.body;
  User.create(username, email, password, other).then(res.ok).catch(res.fail);
});

route.post('/user/destroy', (req, res) => {
  const {username, password} = req.body;
  User.destroy(username, password).then(res.ok).catch(res.fail);
});

// Users sends in the phone number for initial first layer signup
route.post('/user/signup', (req, res) => {
  if (isEmpty(req.body.phoneNumber)) {
    res.status(400);
    res.fail(['routes', 'api', '/user/signup', 'User.signup'],
      'Client tried to send null phone number.',
      "Sorry, you didn't send us a phone number.",
      'Fail');
  } else {
    User.signup(req.body.phoneNumber)
      .then(response => {
        console.tag('routes', 'api', '/user/signup', 'User.signup', 'SMS').log(response);
        res.ok(['routes', 'api', '/user/signup', 'User.signup'],
          'New user created. Sending full welcome message.',
          {}, `We have sent a text message to your number: ${req.body.phoneNumber}`);
      })
      .catch(error => {
        if (error.name === 'SequelizeValidationError') {
          res.status(400);
          res.fail(['routes', 'api', '/user/signup', 'User.signup'],
            error,
            'Sorry, that is not a valid number.',
            'Fail');
        } else {
          switch (error.code) {
          // Invalid To Number
          case 21211:
            res.status(400);
            res.fail(['routes', 'api', '/user/signup', 'User.signup'],
              error,
              'Sorry, that is not a real phone number.',
              'Fail');
            break;
          // Twilio Trial: Not a Verified number
          case 21608:
            res.status(404);
            res.fail(['routes', 'api', '/user/signup', 'User.signup'],
              error,
              'Sorry, we are currently in private beta. Our service is not available to you yet.',
              'Fail');
            break;
          default:
            res.status(500);
            res.fail(['routes', 'api', '/user/signup', 'User.signup'],
              error,
              'Sorry, a text message to your phone could not be sent! Please try again.',
              'Fail');
          }
        }
      });
  }
});

route.post('/telemetry/:expose', (req, res) => {
  let tags = req.body.tags;
  let message = req.body.message;

  if (!tags) {
    tags = [];
  } else if (!Array.isArray(tags)) {
    tags = [tags];
  }

  if (!message) {
    message = [];
  } else if (!Array.isArray(tags)) {
    message = [message];
  }

  console
      .tag('telemetry', ip(req), ...tags)
      .log(...message)
      .then(() => res.ok(['telemetry'], 'Logging telemetry', null, 'Success'));
});

export default route;
