import {Router} from 'express';
import _ from 'underscore';
import {create, findByRestaurant} from '../../../api/message.es6';
import {sendSMS} from '../../../api/sms.es6';
import * as Notification from '../../../api/notification.es6';

const route = new Router();

function normalize(toNumber) {
  return `${String(toNumber)
  .replace('+1', '')}`;
}

route.use((req, res, next) => {
  res.ok = (tags, logMessage, data, resMessage, status = 0) => {
    console.tag(...tags)
           .log(logMessage);
    res.json({status, message: resMessage, data: data && data.toJSON ? data.toJSON() : data});
  };
  res.fail = (tags, logMessage, resMessage, status = 1) => {
    console.tag(...tags)
           .error(logMessage);
    res.json({status, message: resMessage});
  };
  next();
});

route.post('/token', async (req, res) => {
  // TODO NEEDS TO BE REPLACED WITH USER AUTHENTICATION
  // 0 for now for Sid's Messenger
  const restaurantID = 0;

  try {
    const accessor = await Notification.createSocket(restaurantID);
    const address = await Notification.address();

    const {uuid, token} = accessor;

    const successMsg = `Successfully created token: ${token} on ${uuid}`;
    res.ok(['routes', 'messenger', 'token'], {address, accessor}, {address, accessor}, successMsg);
  } catch (err) {
    res.status(500)
       .fail(['routes', 'messenger', 'token'], err, `Unable to create token`);
  }
});

// Used to get all messages
route.post('/messages', (req, res) => {
  // TODO NEEDS TO BE REPLACED WITH USER AUTHENTICATION
  // 0 for now for Sid's Messenger
  const restaurantID = 0;

  findByRestaurant(restaurantID)
  .then(messages => {
    const resMessages = _.map(messages, msg =>
      msg.success ? msg : null
    );
    const filteredMessages = _.without(resMessages, null);
    res.send({data: {count: filteredMessages.length, messages: filteredMessages}});
  })
  .catch(findMessagesError => {
    res.status(500)
       .fail(['routes', 'messenger', 'messages'], findMessagesError, 'Could not retreive your messages');
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
           date, response.sid, normalize(response.from), false, true)
    .then(() => {
      // Get all tokens relevant to said id
      // TODO Give me the actual response from the db
      const resBody = {
        phoneNumber: normalize(response.to),
        content: response.body, date,
        twilioNumber: '5125200133',
        sentByUser: false
      };

      Notification.notify(restaurantID, 'send', resBody, false);

      res.ok(['routes', 'messenger', '/send'],
             'New send message created.',
             {phoneNumber, content}, `We have sent your text message to the number:
              ${phoneNumber}`);
    })
    .catch(createError => {
      res.status(500)
         .fail(sendFailTags, createError, failResMsg);
    });
  })
  .catch(sendSMSError => {
    res.status(500)
       .fail(sendFailTags, sendSMSError, failResMsg);
  });
});

export default route;
