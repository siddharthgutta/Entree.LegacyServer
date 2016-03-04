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

async function createTestUser() {
  const phone = Math.floor(Math.random() * 10000000000).toString();

  return await User.UserModel.create(phone, {
    firstName: chance.first(),
    lastName: chance.last(),
    email: chance.email()
  });
}

async function url() {
  const _address = config.get('Server');
  _address.hostname = await Runtime.hostname();
  return format(_address);
}

async function createTestRestaurant() {
  const name = chance.word();
  return await Restaurant.RestaurantModel.create(name, 'test', Restaurant.RestaurantModel.Mode.GOD);
}

async function fetchToken(id, password) {
  const address = await url();
  const {body: {data: {token}}} = await fetch(`${address}/api/v2/restaurant/login`, {
    method: 'post',
    body: {id, password}
  });

  return token;
}

router.get('/generate/user', async (req, res) => {
  const user = await createTestUser();
  const {secret} = await User.requestProfileEdit(user.id);
  const _url = await User.resolveProfileEditAddress(secret);

  res.ok({user, url: _url});
});


router.get('/generate/restaurant', async (req, res) => {
  const name = chance.word();
  const {mode} = String(req.query.mode).toUpperCase() === Restaurant.RestaurantModel.Mode.GOD ?
    Restaurant.RestaurantModel.Mode.GOD : Restaurant.RestaurantModel.Mode.REGULAR;
  const restaurant = await Restaurant.RestaurantModel.create(name, 'test', mode);
  const {id, password} = restaurant;
  const address = await url();
  const token = await fetchToken(id, password);

  restaurant.close = `${address}/api/v2/test/restaurant/${id}/enabled?enabled=false`;
  restaurant.open = `${address}/api/v2/test/restaurant/${id}/enabled?enabled=true`;
  restaurant.order = `${address}/api/v2/test/generate/order/${id}`;
  restaurant.info = `${address}/api/v2/restaurant/info?token=${token}`;

  res.ok({restaurant});
});


router.get('/generate/order/:id*?', async (req, res) => {
  try {
    const items = [
      {
        name: 'Cheeseburger',
        price: 6.50,
        quantity: 1,
        description: 'good drink'
      }, {
        name: 'Republican',
        price: 7.38,
        quantity: 2,
        description: 'great drink'
      }, {
        name: 'Fountain Drink',
        price: 1.05,
        quantity: 2,
        description: 'great drink'
      }
    ];

    const {id} = req.params;
    let restaurant;

    if (!id) {
      restaurant = await createTestRestaurant();
    } else {
      restaurant = await Restaurant.RestaurantModel.findOne(id);
    }

    const user = await createTestUser();
    const order = await Order.createOrder(user.id, restaurant.id, items);
    const creds = `&id=${restaurant.id}&password=${restaurant.password}`;
    const address = await url();

    order.accept = `${address}/api/v2/test/order/${order.id}/status?status=ACCEPTED${creds}`;
    order.decline = `${address}/api/v2/test/order/${order.id}/status?status=DECLINED${creds}`;
    order.paid = `${address}/api/v2/test/order/${order.id}/status?status=RECEIVED_PAYMENT${creds}`;

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
      await Order.setOrderStatus(id, Order.Status.RECEIVED_PAYMENT);
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

    const token = await fetchToken(restaurantId, password);
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
    const token = await fetchToken(id, restaurant.password);
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
