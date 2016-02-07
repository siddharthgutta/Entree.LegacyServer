import {Router} from 'express';
import * as Token from '../api/token.es6';
import * as User from '../api/user.es6';

const route = new Router();

route.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.ok = (tags, logMessage, data, resMessage) => {
    console.tag(...tags).log(logMessage);
    res.json({status: 0, data: data.toJSON ? data.toJSON() : data, resMessage});
  };
  res.fail = (tags, logMessage, resMessage, status) => {
    console.tag(...tags).log(logMessage);
    res.json({status: status || 1, resMessage});
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
  User.signup(req.body.phoneNumber)
    .then(response => {
      console.tag('routes', 'api', '/user/signup', 'User.signup', 'SMS').log(JSON.stringify(response));
      res.ok(['routes', 'api', '/user/signup', 'User.signup', 'SUCCESS'],
        'New user created. Sending full welcome message.',
        {}, `We have sent a text message to your number: ${req.body.phoneNumber}`);
    }).catch(error => {
      res.fail(['routes', 'api', '/user/signup', 'User.signup', 'ERROR'],
        `Error: ${error}`,
        'Sorry, a text message to your phone could not be sent! Please try again.',
        500);
    });
});

export default route;
