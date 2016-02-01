import {Router} from 'express';
import * as Token from '../api/token.es6';
import * as User from '../api/user.es6';

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

export default route;
