import {Router} from 'express';
import * as User from '../../../api/controllers/user.es6';
import * as Restaurant from '../../../api/controllers/restaurant.es6';
import * as Order from '../../../api/controllers/order.es6';
import fetch from '../../../libs/fetch.es6';
import config from 'config';
import Chance from 'chance';
import * as Runtime from '../../../libs/runtime.es6';
import {format} from 'url';

const router = new Router();
const chance = new Chance();

async function url() {
  const _address = config.get('Server');
  _address.hostname = await Runtime.hostname();
  return format(_address);
}

export async function createTestUser() {
  const phone = (Date.now() + Math.floor(Math.random() * 5000)).toString().substr(-10);

  return await User.UserModel.create(phone, {
    firstName: chance.first(),
    lastName: chance.last(),
    email: chance.email()
  });
}

export async function createTestRestaurant() {
  const name = chance.word();
  return await Restaurant.RestaurantModel.create(name, name.replace(/[^0-9a-zA-Z]/g, '').toLowerCase(),
                                                 'test', Restaurant.RestaurantModel.Mode.GOD);
}

export async function createTestToken(id) {
  const {handle, password} = await Restaurant.RestaurantModel.findOne(id);
  const address = await url();
  const {body: {data: {token}}} = await fetch(`${address}/api/v2/restaurant/login`, {
    method: 'post',
    body: {id: handle, password}
  });

  return token;
}

export async function createTestOrder(userId, restaurantId, items = [
  {
    name: 'Cheeseburger',
    price: 650,
    quantity: 1,
    description: 'good drink'
  }, {
    name: 'Republican',
    price: 738,
    quantity: 2,
    description: 'great drink'
  }, {
    name: 'Fountain Drink',
    price: 105,
    quantity: 2,
    description: 'great drink'
  }
]) {
  return await Order.createOrder(userId, restaurantId, items);
}

export async function markTestOrderAsReceived(id) {
  await Order.setOrderStatus(id, Order.Status.RECEIVED_PAYMENT,
                             {transactionId: chance.integer({min: 100000, max: 999999})});
}

router.get('/generate/user', async (req, res) => {
  const user = await createTestUser();
  const secret = await User.requestProfileEdit(user.id);
  const _url = await User.resolveProfileEditAddress(secret);

  res.ok({user, url: _url});
});


router.get('/generate/restaurant/:name*?', async (req, res) => {
  const name = req.params.name || chance.word();
  const {mode} = String(req.query.mode).toUpperCase() === Restaurant.RestaurantModel.Mode.GOD ?
    Restaurant.RestaurantModel.Mode.GOD : Restaurant.RestaurantModel.Mode.REGULAR;
  const restaurant =
    await Restaurant.RestaurantModel.create(name, name.replace(/[^0-9a-zA-Z]/g, '').toLowerCase(),
                                            'test', mode, {phoneNumber: '9999999999'});
  const {id, password} = restaurant;
  const address = await url();
  const token = await createTestToken(id, password);

  restaurant.close = `${address}/api/v2/test/restaurant/${id}/enabled?enabled=false`;
  restaurant.open = `${address}/api/v2/test/restaurant/${id}/enabled?enabled=true`;
  restaurant.order = `${address}/api/v2/test/generate/order/${id}`;
  restaurant.info = `${address}/api/v2/restaurant/info?token=${token}`;

  res.ok({restaurant});
});


router.get('/generate/order/:id*?', async (req, res) => {
  try {
    const {id} = req.params;
    let restaurant;

    if (!id) {
      restaurant = await createTestRestaurant();
    } else {
      restaurant = await Restaurant.RestaurantModel.findOne(id);
    }

    const user = await createTestUser();
    const order = await createTestOrder(user.id, restaurant.id);
    const address = await url();

    order.accept = `${address}/api/v2/test/order/${order.id}/status?status=ACCEPTED&id=${restaurant.id}`;
    order.decline = `${address}/api/v2/test/order/${order.id}/status?status=DECLINED&id=${restaurant.id}`;
    order.paid = `${address}/api/v2/test/order/${order.id}/status?status=RECEIVED_PAYMENT&id=${restaurant.id}`;

    res.ok({order});
  } catch (e) {
    res.fail('Failed; check error logs!').debug(e);
  }
});

router.get('/order/:id/status', async (req, res) => {
  const {id} = req.params;
  const {status, id: restaurantId, password} = req.query;
  const message = 'Accepted your order';
  const prepTime = 50;

  try {
    try {
      await markTestOrderAsReceived(id);
    } catch (e) {
      if (status === Order.Status.RECEIVED_PAYMENT) {
        throw e;
      }
    }

    const order = await Order.OrderModel.findOne(id);
    const address = await url();

    if (status === Order.Status.RECEIVED_PAYMENT) {
      return res.ok(order);
    }

    const token = await createTestToken(restaurantId, password);
    const {body: {data}} = await fetch(`${address}/api/v2/restaurant/order/${id}/status`, {
      method: 'post',
      body: {token, status, prepTime, message}
    });

    res.ok(data);
  } catch (e) {
    res.fail('Failed; check error logs!').debug(e);
  }
});

router.get('/restaurant/:id/enabled', async (req, res) => {
  const {id} = req.params;
  const {enabled} = req.query;
  const restaurant = await Restaurant.RestaurantModel.findOne(id);
  const address = await url();

  try {
    const token = await createTestToken(id, restaurant.password);
    const {body: {data}} = await fetch(`${address}/api/v2/restaurant/enabled`, {
      method: 'post',
      body: {token, enabled}
    });

    res.ok(data);
  } catch (e) {
    res.fail('Failed; check error logs!').debug(e);
  }
});

export default router;
