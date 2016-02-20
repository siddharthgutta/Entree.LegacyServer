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

route.post('/token', (req, res) => {
  // TODO NEEDS TO BE REPLACED WITH USER AUTHENTICATION
  // 0 for now for Sid's Messenger
  const restaurantID = 0;
  const token = shortid.generate();
  addTokenOrCreate(restaurantID, token).then(result => {
    socketServer.accept(token).then(acceptedToken => {
      const successMsg = `Successfully created token: ${acceptedToken}`;
      res.ok(['routes', 'messenger', 'token'], result, acceptedToken, successMsg);
    }).catch(acceptError => {
      res.status(500).fail(['routes', 'messenger', 'token'], acceptError, `Unsuccessfully Created Token: ${token}`);
    });
  }).catch(err => {
    res.status(500).fail(['routes', 'messenger', 'token'], err, `Unsuccessfully Created Token: ${token}`);
  });
});

// Used to get all messages
route.post('/messages', (req, res) => {
  // TODO NEEDS TO BE REPLACED WITH USER AUTHENTICATION
  // 0 for now for Sid's Messenger
  const restaurantID = 0;

  findByRestaurant(restaurantID).then(messages => {
    const resMessages = _.map(messages, msg =>
      msg.success ? _.pick(msg, 'phoneNumber', 'content', 'date', 'sentByUser') : null
    );
    const filteredMessages = _.without(resMessages, null);
    res.send({count: filteredMessages.length, messages: filteredMessages});
  }).catch(findMessagesError => {
    res.status(500).fail(['routes', 'messenger', 'messages'], findMessagesError, 'Could not retreive your messages');
  });
});

const sendFailTags = ['routes', 'messenger', '/send'];
const failResMsg = 'Sorry, we had a problem sending your message. Please try again.';

route.post('/send', (req, res) => {
  // TODO NEEDS TO BE REPLACED WITH USER AUTHENTICATION
  // 0 for now for Sid's Messenger
  const restaurantID = 0;

  const content = req.body.content;
  const phoneNumber = req.body.phoneNumber;

  sendSMS(phoneNumber, content)
    .then(response => {
      const date = new Date(response.dateCreated).getTime();
      create(normalize(response.to), restaurantID, response.body,
        date, response.sid, normalize(response.from), false, true).then(() => {
          // Get all tokens relevant to said id
          const resBody = {phoneNumber: normalize(response.to), content: response.body, date, sentByUser: false};

          findOne(restaurantID).then(result => {
            result.tokens.forEach(token => {
              socketServer.emit(token, 'send', resBody);
            });
            res.ok(['routes', 'messenger', '/send', 'User.signup'],
              'New send message created.',
              {phoneNumber, content}, `We have sent your text message to the number: ${req.body.phoneNumber}`);
          }).catch(findOneError => {
            res.status(500).fail(sendFailTags, findOneError, failResMsg);
          });
        }).catch(createError => {
          res.status(500).fail(sendFailTags, createError, failResMsg);
        });
    }).catch(sendSMSError => {
      res.status(500).fail(sendFailTags, sendSMSError, failResMsg);
    });
});

export default route;
