import {Router} from 'express';
import shortid from 'shortid';
import _ from 'underscore';
import {create, findByRestaurant} from '../api/message.es6';
import {sendSMS} from '../api/sms.es6';
import socketServer from '../message/socket-server.es6';
import {findOne, addTokenOrCreate, removeToken} from '../api/socketToken.es6';
import Promise from 'bluebird';
import async from 'async';

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

// ensure all stored tokens are still alive; otherwise kick them out
function validateSockets(restaurantID) {
  return new Promise(resolve => {
    findOne(restaurantID)
        .then(results => {
          // run in parallel this should be fast
          // 2 seconds for now; this can be reduced to 1 - 1.5 seconds
          async.each(results.tokens, (token, callback) => {
            console.log('Checking', token);
            socketServer.emit(token, 'alive?', {}, 2000)
                .then(data => {
                  console.log('Received', data);
                  callback();
                })
                .catch(() => {
                  console.log('Removing', token);
                  removeToken(restaurantID, token);
                  socketServer.reject(token);
                  callback();
                });
          }, () => resolve());
        })
        .catch(e => {
          console.error(e);
          resolve();
        });
  });
}

route.post('/token', (req, res) => {
  // TODO NEEDS TO BE REPLACED WITH USER AUTHENTICATION
  // 0 for now for Sid's Messenger
  const restaurantID = 0;
  const reqToken = shortid.generate();

  console.log(reqToken);

  validateSockets(restaurantID)
      .then(() => addTokenOrCreate(restaurantID, reqToken)
          .then(() => Promise.all([socketServer.address(), socketServer.accept(reqToken)]))
          .spread((address, token) => {
            // add any listeners to remove disconnected ones; speeds up the general awk check
            // this could have some implications like those who are trying to reconnect via socket.io poll
            // TODO please review @jesse @jadesym
            const removeEvent = socketServer.for(socketServer.eventMap.responseClientDisconnected, token);
            socketServer.once(removeEvent, () => {
              console.log('Removing token', token);
              removeToken(restaurantID, token);
              socketServer.reject(token);
            });

            const successMsg = `Successfully created token: ${token}`;
            res.ok(['routes', 'messenger', 'token'], {token, address},
                {token, address}, successMsg); // renaming for minimization
          })
      )
      .catch(err => res.status(500).fail(['routes', 'messenger', 'token'],
          err, `Unsuccessfully created token: ${reqToken}`));
});

// Used to get all messages
route.post('/messages', (req, res) => {
  // TODO NEEDS TO BE REPLACED WITH USER AUTHENTICATION
  // 0 for now for Sid's Messenger
  const restaurantID = 0;

  findByRestaurant(restaurantID).then(messages => {
    const resMessages = _.map(messages, msg =>
        msg.success ? msg : null
    );
    const filteredMessages = _.without(resMessages, null);
    res.send({data: {count: filteredMessages.length, messages: filteredMessages}});
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
              // TODO Give me the actual response from the db
              const resBody = {
                phoneNumber: normalize(response.to),
                content: response.body, date,
                twilioNumber: '5125200133',
                sentByUser: false
              };

              findOne(restaurantID)
                  .then(result => {
                    result.tokens.forEach(token => {
                      socketServer.emit(token, 'send', resBody, false);
                    });
                    res.ok(['routes', 'messenger', '/send', 'User.signup'],
                        'New send message created.',
                        {phoneNumber, content}, `We have sent your text message to the number:
                        ${req.body.phoneNumber}`);
                  })
                  .catch(findOneError => {
                    res.status(500).fail(sendFailTags, findOneError, failResMsg);
                  });
            })
            .catch(createError => {
              res.status(500).fail(sendFailTags, createError, failResMsg);
            });
      })
      .catch(sendSMSError => {
        res.status(500).fail(sendFailTags, sendSMSError, failResMsg);
      });
});

export default route;
