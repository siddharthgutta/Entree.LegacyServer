import {Router} from 'express';
import * as User from '../../../api/controllers/user.es6';
import {isEmpty} from '../../../libs/utils.es6';

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
    res.fail(`Sorry, a text message to your phone could not be sent!`, null, 500).debug(e);
  }
});

router.get('/profile/:secret', async (req, res) => {
  const {secret} = req.params;

  if (isEmpty(secret)) {
    return res.fail('Please try again. Invalid secret', null, 400)
              .debug('Client tried to a null secret');
  }

  try {
    const profile = await User.getUserProfile(secret);
    res.ok(profile, 'Sent profile!').debug(profile);
  } catch (e) {
    res.fail(`Sorry, we couldn't provide you with the profile`, null, 500).debug(e);
  }
});

router.post('/profile/:secret', async (req, res) => {
  const {secret} = req.params;

  if (isEmpty(secret)) {
    return res.fail('Please try again. Invalid secret', null, 400)
              .debug('Client tried to a null secret');
  }

  try {
    const {email, name} = req.body;
    const profile = await User.updateUserProfile(secret, {email, name});
    res.ok(profile, 'Updated profile!').debug(profile);
  } catch (e) {
    res.fail(`Sorry, we couldn't update your profile`, null, 500).debug(e);
  }
});


export default router;
