import {Router} from 'express';
import * as User from '../../../api/controllers/user.es6';
import {ip, isEmpty} from '../../../libs/utils.es6';
import Messsenger from './messenger.es6';
import {create} from '../../../api/message.es6';
import * as Notification from '../../../api/controllers/notification.es6';

const route = new Router();

function normalize(toNumber) {
  return `${String(toNumber).replace('+1', '')}`;
}

route.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

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

const signupTags = ['routes', 'api', '/user/signup'];
const failResMsg = 'Sorry, a text message to your phone could not be sent! Please try again.';

// Users sends in the phone number for initial first layer signup
route.post('/user/signup', (req, res) => {
  if (isEmpty(req.body.phoneNumber)) {
    res.status(400).fail(signupTags, 'Client tried to send null phone number.',
                         "Sorry, you didn't send us a phone number.");
  } else {
    User.signup(req.body.phoneNumber)
        .then(response => {
          const restaurantID = 0;

          console.tag('routes', 'api', '/user/signup', 'SMS').log(response);
          const date = new Date(response.dateCreated).getTime();
          create(normalize(response.to), restaurantID, response.body,
                 date, response.sid, normalize(response.from), false, true)
          .then(() => {
            // Get all tokens relevant to said id
            const resBody = {
              phoneNumber: normalize(response.to),
              content: response.body, date,
              sentByUser: false
            };

            Notification.notify(restaurantID, 'send', resBody);

            res.ok(signupTags,
                   'New send message created.',
                   {phoneNumber: response.to, content: response.body},
                   `We have sent your text message to the number: ${response.to}`);
          }).catch(createError => {
            res.status(500).fail(signupTags, createError, failResMsg);
          });
          res.ok(signupTags, 'New user created. Sending full welcome message.',
                 {}, `We have sent a text message to your number: ${req.body.phoneNumber}`);
        })
        .catch(error => {
          if (error.name === 'SequelizeValidationError') {
            res.status(400).fail(signupTags, error,
                                 'Sorry, that is not a valid number.');
          } else {
            switch (error.code) {
              // Invalid To Number
              case 21211:
                res.status(400)
                   .fail(signupTags, error, 'Sorry, that is not a real phone number.');
                break;
              // Twilio Trial: Not a Verified number
              case 21608:
                res.status(404).fail(signupTags, error,
                                     `Sorry, we are currently in private beta. Our service is not
                                     available to you yet.`);
                break;
              default:
                res.status(500).fail(signupTags, error,
                                     'Sorry, a text message to your phone could not be sent! Please try again.');
            }
          }
        });
  }
});

// TEST hook
route.get('/version', (req, res) => res.send('v1'));

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

  console.tag('telemetry', ip(req), ...tags).log(...message);

  res.status(200);
  res.ok(['telemetry'], 'Logging telemetry', null, 'Success');
});

route.use('/messenger', Messsenger);

export default route;
