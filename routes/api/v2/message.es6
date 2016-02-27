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

  res.ok('Send messages', messages.filter(msg => msg.success));
});


/**
 * Send a text
 */
router.post('/send', isAuthenticated, async (req, res) => {
  const {id} = req.user;
  const {content, phoneNumber} = req.body;

  const messages = await Message.findByRestaurant(id);
  const text = await SMS.sendSMS(phoneNumber, content);

  console.log(req.tags, {text});

  res.ok('Sent message', messages.filter(msg => msg.success));
});


export default router;
