/**
* Created by kfu on 2/15/16.
*/

import {Router} from 'express';
import shortid from 'shortid';
import _ from 'underscore';
import {create, findByRestaurant} from '../api/message.es6';
import {sendSMS} from '../api/sms.es6';
import socketServer from '../message/socket-server.es6';
import {findOne, addTokenOrCreate} from '../api/socketToken.es6';

const route = new Router();

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

route.post('/token', (req, res) => {
  // TODO NEEDS TO BE REPLACED WITH USER AUTHENTICATION
  // 0 for now for Sid's Messenger
  const restaurantID = 0;
  const token = shortid.generate();
  addTokenOrCreate(restaurantID, token).then(result => {
    socketServer.accept(token);
    const successMsg = `Successfully created token: ${token}`;
    res.ok(['routes', 'messenger', 'token'], result, successMsg);
  }).catch(err => {
    res.status(500).fail(['routes', 'messenger', 'token'], err, `Unsuccessfully Created Token: ${token}`);
  });
});

// Used to get all messages
route.post('/messages', (req, res) => {
  // TODO NEEDS TO BE REPLACED WITH USER AUTHENTICATION
  // 0 for now for Sid's Messenger
  const restaurantID = 0;

  const dbMessages = findByRestaurant(restaurantID);
  const resMessages = _.map(dbMessages, msg =>
    msg.success ? _.pick(msg, 'phoneNumber', 'content', 'date', 'sentByUser') : null
  );
  res.send(_.without(resMessages, null));
});

const sendFailTags = ['routes', 'messenger', '/send'];
const failResMsg = 'Sorry, we had a problem sending your message. Please try again.';

route.post('/send', (req, res) => {
  // TODO NEEDS TO BE REPLACED WITH USER AUTHENTICATION
  // 0 for now for Sid's Messenger
  const restaurantID = 0;

  const content = req.body.content;
  const number = req.body.phoneNumber;
  sendSMS(number, content)
    .then(response => {
      const date = new Date(response.dateCreated);
      create(response.phoneNumber, restaurantID, response.body, date, response.sid, response.from, false, true);
      // Get all tokens relevant to said id
      const resBody = {phoneNumber: response.to, content: response.body, date, sentByUser: false};

      findOne(restaurantID).then(result => {
        result.tokens.forEach(token => {
          socketServer.emit(token, 'send', resBody);
        });
        res.ok(['routes', 'messenger', '/send', 'User.signup'],
          'New send message created.',
          {}, `We have sent your text message to the number: ${req.body.phoneNumber}`);
      }).catch(err => {
        res.status(500).fail(sendFailTags, err, failResMsg);
      });
    }).catch(error => {
      res.status(500);
      res.fail(sendFailTags, error, failResMsg);
    });
});

export default route;
