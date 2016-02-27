import {Router} from 'express';
import * as User from '../../../api/user.es6';
import {isEmpty} from '../../../libs/utils.es6';
import authenticate from './authenticate.es6';
import * as Notification from '../../../api/notification.es6';

const router = new Router();

router.post('/signup', async (req, res) => {
  const {phoneNumber} = req.body;

  if (isEmpty(phoneNumber)) {
    return res.fail('Sorry, you didn\'t send us a phone number.', null, 400)
              .debug('Client tried to send null phone number.');
  }

  try {
    await User.signup(phoneNumber);
    res.ok(null, 'Sent you a text!');
  } catch (e) {
    res.fail(`Sorry, a text message to your phone could not be sent!`, null, 500)
       .debug(e.message);
  }
});

router.post('/login', authenticate, (req, res) => {
  const {token, uuid, address} = req.user;

  res.ok({token, uuid, address}).debug('Signed in');
});

router.post('/logout', authenticate, (req, res) => {
  const {id, token} = req.user;
  Notification.removeSocket(id, token);
  req.logout();

  res.ok(null, 'Success').debug('Signed out');
});

export default router;
