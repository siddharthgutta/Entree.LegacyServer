import {Router} from 'express';
import authenticate, {isAuthenticated} from './authenticate.es6';
import * as Order from '../../../api/controllers/order.es6';
import * as Restaurant from '../../../api/controllers/restaurant.es6';
import * as Notification from '../../../api/controllers/notification.es6';

const router = new Router();

router.post('/login', authenticate, (req, res) => {
  const {token} = req.user;

  res.ok({token}).debug('Signed in');
});

router.post('/logout', authenticate, (req, res) => {
  const {id, token} = req.user;
  Notification.removeSocket(id, token);
  req.logout();

  res.ok(null, 'Success').debug('Signed out');
});

router.post('/socket', isAuthenticated, async(req, res) => {
  const {id} = req.user;

  try {
    const {uuid} = await Notification.createSocket(id);
    const address = await Notification.address();
    res.ok({uuid, address}).debug('Created order');
  } catch (e) {
    res.fail(e.message).debug(e, 'Could not create socket');
  }
});

router.post('/orders', isAuthenticated, async(req, res) => {
  const {id} = req.user;

  try {
    const orders = await Order.Model.findByRestaurant(id);
    res.ok(orders).debug('Found orders');
  } catch (e) {
    res.fail(e.message).debug(e, 'Could not find orders');
  }
});

router.get('/order/:id', isAuthenticated, async(req, res) => {
  const {id} = req.params;

  try {
    const order = await Order.Model.findOne(id);
    res.ok(order).debug('Found order');
  } catch (e) {
    res.fail(e.message).debug(e, 'Could not find order');
  }
});

router.post('/order/:id/status', isAuthenticated, async(req, res) => {
  const {id: order} = req.params;
  const {status, time, message} = req.body;

  try {
    const {status: nextStatus} = await Order.setStatus(order, status, {time, message});
    res.ok({status: nextStatus}, `Order status is now ${nextStatus}`);
  } catch (e) {
    res.fail(`Failed to set status of order: ${e.message}`).debug(e);
  }
});

router.post('/operate', isAuthenticated, async(req, res) => {
  const {id} = req.user;
  const {status} = req.body;

  try {
    const {status: nextStatus} = await Restaurant.setOperation(id, status);
    res.ok({status: nextStatus}, `Status is now ${nextStatus}`);
  } catch (e) {
    res.fail(`Failed to set state: ${e.message}`).debug(e);
  }
});

export default router;
