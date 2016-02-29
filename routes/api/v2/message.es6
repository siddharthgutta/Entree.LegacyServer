import {Router} from 'express';
import * as Message from '../../../api/message.es6';
import * as SMS from '../../../api/sms.es6';
import {isAuthenticated} from './authenticate.es6';


const router = new Router();

/**
 * Get all texts
 *
 * TODO add query features
 */
router.post('/', isAuthenticated, async (req, res) => {
  const {id} = req.user;
  const messages = await Message.findByRestaurant(id);

  res.ok({messages: messages.filter(msg => msg.success)}).debug('Sent messages');
});


/**
 * Send a text
 */
router.post('/send', isAuthenticated, async (req, res) => {
  const {content, phoneNumber} = req.body;
  const text = await SMS.sendSMS(phoneNumber, content);

  res.ok('Sent message').debug({text});
});


export default router;
