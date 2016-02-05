import {Router} from 'express';
import * as Token from '../api/token.es6';
import * as User from '../api/user.es6';
import {sendSMS} from '../api/sms.es6';

const route = new Router();

route.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.ok = (data, message) => res.json({status: 0, data: data.toJSON ? data.toJSON() : data, message});
  res.fail = (cause, message, status) => res.json({status: status || 1, cause, message});
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

const returnGreeting = "Welcome back! Hi, I'm here to help you order ahead at your favorite restaurants. " +
  'Type in /r to see where I work. Type in /help at any point if you need help.';

// Users sends in the phone number for initial first layer signup
route.post('/user/signup/:number', (req, res) => {
  User.findOne(req.params.number)
    .then(user => {
      if (!user) {
        User.signup(req.params.number)
          .then(() => {
            console.tag('routes', 'api', '/user/signup', 'User.signup', 'SUCCESS')
              .log('New user created. Sending full welcome message.');
            res.ok({}, `We have sent a text message to your number: ${req.params.number}`);
          }).catch(error => {
            console.tag('routes', 'api', '/user/signup', 'User.signup', 'ERROR')
              .log(`Error: ${error.message}`);
            res.fail('Internal Server Error',
              'Sorry, a text message to your phone could not be sent! Please try again.',
              500);
          });
      } else {
        sendSMS(req.params.number, returnGreeting)
          .then(() => {
            console.tag('routes', 'api', '/user/signup', 'User.findOne', 'SUCCESS')
              .log('Existing user already found. Return welcome message was sent');
            res.ok({}, `We have sent a text message to your number: ${req.params.number}`);
          }).catch(error => {
            console.tag('routes', 'api', '/user/signup', 'User.findOne', 'ERROR')
              .log(`User account already existed, but text message was not sent successfully. Error: ${error}`);
            res.fail('Internal Server Error',
              'Sorry, a text message to your phone could not be sent! Please try again.',
              500);
          });
      }
    });
});

export default route;
