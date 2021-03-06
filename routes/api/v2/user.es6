import {Router} from 'express';
import * as User from '../../../api/controllers/user.es6';
import Emitter, {Events} from '../../../api/events/index.es6';
import * as Payment from '../../../api/payment.es6';
import * as Runtime from '../../../libs/runtime.es6';
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

router.get('/client-token', async (req, res) => {
  try {
    const clientToken = await Payment.generateClientToken();
    res.ok({clientToken}, 'Sent client token!').debug(clientToken);
  } catch (e) {
    res.fail(`Could not get client token`, null, 500).debug(e);
  }
});

const profile = router.route('/profile/:secret');

profile.get(async (req, res) => {
  const {secret} = req.params;

  if (isEmpty(secret)) {
    return res.fail('Please try again. Invalid secret', null, 400)
              .debug('Client tried to a null secret');
  }

  try {
    const user = await User.getUserProfile(secret);

    res.ok({user}, 'Sent profile!').debug(user);
  } catch (e) {
    res.fail(`Sorry, we couldn't provide you with the profile`, null, 500).debug(e);
  }
});

profile.post(async (req, res) => {
  const {secret} = req.params;

  if (isEmpty(secret)) {
    return res.fail('Please try again. Invalid secret', null, 400)
              .debug('Client tried to a null secret');
  }

  let user;
  try {
    user = await User.updateUserProfile(secret, req.body);
  } catch (e) {
    return res.fail(`Sorry, we couldn't update your account with that name or e-mail. ` +
      `Please try again.`, null, 500).debug(e);
  }
  try {
    try {
      await Payment.registerPaymentForUser(user.id, req.body.payment_method_nonce, Runtime.isProduction());

      process.nextTick(() => Emitter.emit(Events.USER_PAYMENT_REGISTERED, user));
    } catch (e) {
      throw new TraceError('Could not register payment', e);
    }

    res.ok({user}, 'Your account and credit card info has been updated!').debug(user);
  } catch (e) {
    res.fail(`Sorry, your credit card information is incorrect. Please try again.`, null, 500).debug(e);
  }
});


export default router;
