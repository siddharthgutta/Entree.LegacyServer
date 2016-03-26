import './test-init.es6';
import assert from 'assert';
import * as Order from '../api/controllers/order.es6';
import * as Restaurant from '../api/controllers/restaurant.es6';
import * as User from '../api/controllers/user.es6';

let restaurant;
let user;
let order1;
let order2;

describe('User', () => {
  it('should create a restaurant', async () => {
    restaurant = (await Restaurant.RestaurantModel.create('Rest1', 'test', Restaurant.RestaurantModel.Mode.GOD))
      .resolve();
  });

  it('should create a user', async () => {
    user = await User.UserModel.create(new Array(11).join('0'), {firstName: 'F', lastName: 'L', email: 'f@l.com'});
  });

  it('should create invalid orders', async () => {
    try {
      await Order.createOrder(user.id, restaurant.id, [
        {
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
      ]);

      assert.fail('should have failed validation');
    } catch (e) {
      assert.ok('should fail validation');
    }
  });

  it('should create two (2) orders', async () => {
    order1 = await Order.createOrder(user.id, restaurant.id, [
      {
        name: 'Democrat',
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
    ]);

    order2 = await Order.createOrder(user.id, restaurant.id, [
      {
        name: 'Republican',
        price: 7.50,
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
    ]);
  });

  it('should try to RECEIVED_PAYMENT without arguments to failure', async () => {
    try {
      await Order.setOrderStatus(order1.id, Order.Status.RECEIVED_PAYMENT);
      assert.fail('should have thrown an error');
    } catch (e) {
      assert.ok('should throw an error since no transactionId');
    }
  });

  it('should try to ACCEPT without arguments to failure', async () => {
    try {
      await Order.setOrderStatus(order1.id, Order.Status.ACCEPTED);
      assert.fail('should have thrown an error');
    } catch (e) {
      assert.ok('should throw an error since no prepTime');
    }
  });

  it('should try to DECLINE without arguments to failure', async () => {
    try {
      await Order.setOrderStatus(order1.id, Order.Status.DECLINED);
      assert.fail('should have thrown an error');
    } catch (e) {
      assert.ok('should throw an error since no message');
    }
  });

  it('should set to RECEIVED_PAYMENT', async () => {
    await Order.setOrderStatus(order1.id, Order.Status.RECEIVED_PAYMENT, {transactionId: '234234'});
  });

  it('should set to ACCEPT', async () => {
    await Order.setOrderStatus(order1.id, Order.Status.ACCEPTED, {prepTime: 5});
  });

  it('should set to DECLINE', async () => {
    try {
      await Order.setOrderStatus(order1.id, Order.Status.DECLINED, {message: 'Duh'});
      assert.fail('should have thrown an error');
    } catch (e) {
      assert.ok('should throw an error since its not the correct progression');
    }
  });

  it('should try to RECEIVED_PAYMENT multiple times to failure', async () => {
    try {
      await Order.setOrderStatus(order1.id, Order.Status.RECEIVED_PAYMENT, {transactionId: '234234'});
      assert.fail('should have thrown an error');
    } catch (e) {
      assert.ok('should throw an error since its not the correct progression');
    }
  });

  it('should try to ACCEPT multiple times to failure', async () => {
    try {
      await Order.setOrderStatus(order1.id, Order.Status.ACCEPTED, {prepTime: 10});
      assert.fail('should have thrown an error');
    } catch (e) {
      assert.ok('should throw an error since its not the correct progression');
    }
  });

  it('should set to order1 to COMPLETED', async () => {
    await Order.setOrderStatus(order1.id, Order.Status.COMPLETED);
  });

  it('should set to order2 order to DECLINED', async () => {
    await Order.setOrderStatus(order2.id, Order.Status.RECEIVED_PAYMENT, {transactionId: '2234234'});
    await Order.setOrderStatus(order2.id, Order.Status.DECLINED, {message: 'duh'});
  });

  it('should set calculate order total', async () => {
    assert.equal(await Order.getOrderTotalById(order1.id), 6.50 + 7.38 + 1.05);
    assert.equal(await Order.getOrderTotalById(order2.id), 7.50 + 7.38 + 1.05);
  });

  it('should find parent restaurant', async () => {
    const {id: restaurantId1} = await Order.getRestaurantFromOrder(order1.id);
    const {id: restaurantId2} = await Order.getRestaurantFromOrder(order2.id);

    assert.equal(restaurantId1, restaurant.id);
    assert.equal(restaurantId2, restaurant.id);
  });

  it('should find order by id', async () => {
    const {id} = await Order.OrderModel.findOne(order1.id);

    assert.equal(id, order1.id);
  });

  it('should find completed orders', async () => {
    const orders = await Order.OrderModel.findByRestaurant(restaurant.id, [Order.Status.COMPLETED]);

    assert.equal(orders[0].id, order1.id);
  });

  it('should find declined orders', async () => {
    const orders = await Order.OrderModel.findByRestaurant(restaurant.id, [Order.Status.DECLINED]);

    assert.equal(orders[0].id, order2.id);
  });

  it('should find accepted and declined orders', async () => {
    const orders = await Order.OrderModel.findByRestaurant(restaurant.id,
                                                           [Order.Status.DECLINED, Order.Status.COMPLETED]);

    assert.equal(orders.length, 2);
  });
});
