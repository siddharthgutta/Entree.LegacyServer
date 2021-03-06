import {Router} from 'express';
import authenticate, {isAuthenticated, deauthenticate} from './authenticate.es6';
import {broadcast} from '../../../api/controllers/sms.es6';
import * as Order from '../../../api/controllers/order.es6';
import * as Restaurant from '../../../api/controllers/restaurant.es6';
import * as Notification from '../../../api/controllers/notification.es6';

const router = new Router();

router.post('/login', authenticate, (req, res) => {
  const {token} = req.user;

  res.ok({token}).debug('Signed in');
});

router.post('/logout', isAuthenticated, (req, res) => {
  const {id, token} = req.user;
  deauthenticate(token);
  Notification.removeSocket(id, token);
  req.logout();
  res.ok(null, 'Success').debug('Signed out');
});


router.get('/connection', isAuthenticated, (req, res) => {
  res.ok({loggedIn: true}, 'Success');
});


router.get('/info', isAuthenticated, async(req, res) => {
  const {id} = req.user;

  try {
    const restaurant = await Restaurant.getRestaurantWithMetaData(id);
    res.ok({restaurant}).debug('Created order');
  } catch (e) {
    res.fail(e.message).debug(e, 'Could not create socket');
  }
});


router.post('/socket', isAuthenticated, async(req, res) => {
  const {id, token} = req.user;

  try {
    const extras = await Notification.createSocket(id, token);
    const address = await Notification.address();
    res.ok({extras, address}).debug('Created order');
  } catch (e) {
    res.fail(e.message).debug(e, 'Could not create socket');
  }
});

router.get('/orders', isAuthenticated, async(req, res) => {
  const {id} = req.user;
  const {Status} = Order.OrderModel;

  // TODO verify the restaurant! check if GOD and return all
  try {
    const orders = await Order.OrderModel
                              .findByRestaurant(id, [Status.RECEIVED_PAYMENT, Status.ACCEPTED, Status.READY]);
    res.ok({orders}).debug('Found orders');
  } catch (e) {
    res.fail(e.message).debug(e, 'Could not find orders');
  }
});


router.get('/orders/history', isAuthenticated, async(req, res) => {
  const {id} = req.user;
  const {Status} = Order.OrderModel;

  // TODO verify the restaurant! check if GOD and return all
  try {
    const orders = await Order.OrderModel.findByRestaurant(id, [Status.COMPLETED, Status.DECLINED]);
    res.ok({orders}).debug('Found orders');
  } catch (e) {
    res.fail(e.message).debug(e, 'Could not find orders');
  }
});

router.get('/order/:id', isAuthenticated, async(req, res) => {
  const {id} = req.params;

  try {
    const order = await Order.OrderModel.findOne(id, Order.OrderModel.RestaurantReadableStatuses);
    res.ok({order}).debug('Found order');
  } catch (e) {
    res.fail(e.message).debug(e, 'Could not find order');
  }
});

router.post('/order/:id/status', isAuthenticated, async(req, res) => {
  const {id} = req.params;
  const {status, prepTime, message} = req.body;

  try {
    const order = await Order.setOrderStatus(id, status, {prepTime, message}, true);
    res.ok({order}, `Order status is now ${order.status}`);
  } catch (e) {
    res.fail(`Failed to set status of order: ${e.message}`).debug(e);
  }
});

router.post('/enabled', isAuthenticated, async(req, res) => {
  const {id} = req.user;
  const {enabled} = req.body;

  try {
    const restaurant = await Restaurant.setEnabled(id, enabled);

    res.ok({restaurant}, `Enabled is now ${restaurant.enabled}`);
  } catch (e) {
    res.fail(`Failed to set enabled: ${e.message}`).debug(e);
  }
});

router.post('/feedback', isAuthenticated, async(req, res) => {
  const {content} = req.body;
  const {id} = req.user;

  if (typeof content === 'string') {
    const restaurant = await Restaurant.getRestaurantWithMetaData(id);
    broadcast(`${restaurant.name}: ${content}`);
  }

  res.ok();
});

export default router;
