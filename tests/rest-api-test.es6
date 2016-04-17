import {doneAt, clearDatabase} from './test-init.es6';
import assert from 'assert';
import RESTaurant from '../asr/libs/RESTaurant.es6';
import {OrderConstants} from '../api/constants/client.es6';
import fetch from '../libs/fetch.es6';

const {SERVER_URL} = global;
const api = new RESTaurant(SERVER_URL);

let restaurant;
let order;

const getTotalPrice = items => items.reduce((memo, i) => memo + i.price, 0);

before(async () => clearDatabase());
after(async () => api.disconnect());

function assertOrderUpdatedEvent(baseOrder, _order, status) {
  assert.equal(baseOrder.id, _order.id);
  assert.equal(status, _order.status);
}

function assertRestaurantUpdatedEvent(_restaurant, enabled = true) {
  assert.equal(order.Items.length, _restaurant.Orders[0].netCount);
  assert.equal(getTotalPrice(order.Items), _restaurant.Orders[0].netPrice);
  assert.equal(enabled, _restaurant.enabled);
}

describe('should test the front-end rest api connector', () => {
  it('should create a test restaurant', async () => {
    const {body: {data}} = await fetch(`${SERVER_URL}/api/v2/test/generate/restaurant`);
    restaurant = data.restaurant;
  });

  it('should create a test order', async () => {
    const {body: {data}} = await fetch(`${SERVER_URL}/api/v2/test/generate/order/${restaurant.id}`);
    order = data.order;
  });

  it('should connect to the server', async () => {
    const {handle: id, password} = restaurant;
    await api.connect({credentials: {id, password}});
  });

  it('should start streaming', async () => {
    await api.stream();
  });

  it('should test order', async () => {
    const orders = await api.orders();
    assert.equal(0, orders.length);
  });

  it('should "pay" for order; should receive notification', async done => {
    done = doneAt(done, 2);

    api.once(RESTaurant.Events.NEW_ORDER, _order => {
      assertOrderUpdatedEvent(order, _order, OrderConstants.Status.RECEIVED_PAYMENT);
      done();
    });

    api.once(RESTaurant.Events.RESTAURANT_UPDATED, _restaurant => {
      assert.equal(_restaurant.Orders.length, 0);
      done();
    });

    setTimeout(async () => await fetch(order.paid), 1500);
  });

  it('should "accept" order; should receive notification', async done => {
    done = doneAt(done, 2);

    api.once(RESTaurant.Events.ORDER_UPDATE, _order => {
      assertOrderUpdatedEvent(order, _order, OrderConstants.Status.ACCEPTED);
      done();
    });

    api.once(RESTaurant.Events.RESTAURANT_UPDATED, _restaurant => {
      assertRestaurantUpdatedEvent(_restaurant);
      done();
    });

    setTimeout(async () => await api.order(order.id, OrderConstants.Status.ACCEPTED, {prepTime: 5}), 1500);
  });

  it('should mark order as "ready"; should receive notification', async done => {
    done = doneAt(done, 2);

    api.once(RESTaurant.Events.ORDER_UPDATE, _order => {
      assertOrderUpdatedEvent(order, _order, OrderConstants.Status.READY);
      done();
    });

    api.once(RESTaurant.Events.RESTAURANT_UPDATED, _restaurant => {
      assertRestaurantUpdatedEvent(_restaurant);
      done();
    });

    setTimeout(async () => await api.order(order.id, OrderConstants.Status.READY), 1500);
  });

  it('should "complete" order; should receive notification', async done => {
    done = doneAt(done, 2);

    api.once(RESTaurant.Events.ORDER_UPDATE, _order => {
      assertOrderUpdatedEvent(order, _order, OrderConstants.Status.COMPLETED);
      done();
    });

    api.once(RESTaurant.Events.RESTAURANT_UPDATED, _restaurant => {
      assertRestaurantUpdatedEvent(_restaurant);
      done();
    });

    setTimeout(async () => await api.order(order.id, OrderConstants.Status.COMPLETED), 1500);
  });

  it('should disable restaurant; should receive notification', async done => {
    api.once(RESTaurant.Events.RESTAURANT_UPDATED, _restaurant => {
      assertRestaurantUpdatedEvent(_restaurant, false);
      done();
    });

    setTimeout(async () => {
      await api.enabled(false);

      try {
        await fetch(`${SERVER_URL}/api/v2/test/generate/order/${restaurant.id}`);
        assert.fail('should NOT create order; should throw error');
      } catch (e) {
        assert.ok('correctly threw error');
      }
    }, 1500);
  });

  it('should enable restaurant; should receive notification', async done => {
    api.once(RESTaurant.Events.RESTAURANT_UPDATED, _restaurant => {
      assertRestaurantUpdatedEvent(_restaurant, true);
      done();
    });

    setTimeout(async () => {
      await api.enabled(true);

      try {
        await fetch(`${SERVER_URL}/api/v2/test/generate/order/${restaurant.id}`);
        assert.ok('should create order; should NOT throw error');
      } catch (e) {
        assert.ok('should NOT have created order');
      }
    }, 1500);
  });

  it('should receive restaurant into', async () => {
    const _restaurant = await api.info();
    assertRestaurantUpdatedEvent(_restaurant, true);
  });

  it('should test if connected', async () => {
    assert.equal(true, await api.connected());
  });

  it('should disconnect / reconnect', async () => {
    await api.disconnect();
    assert.equal(false, await api.connected());

    const {handle: id, password} = restaurant;
    await api.connect({credentials: {id, password}});
    assert.equal(true, await api.connected());
  });

  it('should start streaming', async () => {
    await api.stream();
  });

  it('should get order history', async () => {
    const orders = await api.history();
    assert.equal(1, orders.length);
    assert.equal(order.id, orders[0].id);
    assert.equal(order.Items.length, orders[0].Items.length);
    assert.equal(OrderConstants.Status.COMPLETED, orders[0].status);
  });

  it('should create another test order', async () => {
    const {body: {data}} = await fetch(`${SERVER_URL}/api/v2/test/generate/order/${restaurant.id}`);
    order = data.order;
  });

  it('should "pay" for order; should receive notification', async done => {
    done = doneAt(done, 2);

    api.once(RESTaurant.Events.NEW_ORDER, _order => {
      assertOrderUpdatedEvent(order, _order, OrderConstants.Status.RECEIVED_PAYMENT);
      done();
    });

    api.once(RESTaurant.Events.RESTAURANT_UPDATED, _restaurant => {
      assert.equal(_restaurant.Orders.length, 1);
      done();
    });

    setTimeout(async () => await fetch(order.paid), 1500);
  });

  it('should "decline" order; should receive notification', async done => {
    done = doneAt(done, 2);

    api.once(RESTaurant.Events.ORDER_UPDATE, _order => {
      assertOrderUpdatedEvent(order, _order, OrderConstants.Status.DECLINED);
      done();
    });

    api.once(RESTaurant.Events.RESTAURANT_UPDATED, _restaurant => {
      assertRestaurantUpdatedEvent(_restaurant);
      done();
    });

    setTimeout(async () => {
      try {
        await api.order(order.id, OrderConstants.Status.RECEIVED_PAYMENT);
        assert.fail('should not mark as received payment; should throw error');
      } catch (e) {
        assert.ok('should throw error');
      }

      try {
        await api.order(order.id, OrderConstants.Status.DECLINED);
        assert.fail('should decline order; no message; should throw error');
      } catch (e) {
        await api.order(order.id, OrderConstants.Status.DECLINED, {message: 'test message'});
        assert.ok('should decline order');
      }
    }, 1500);
  });

  it('should get order history', async () => {
    // run multiple times
    await api.history();
    await api.history();

    const orders = await api.history();

    assert.equal(2, orders.length);
    assert.equal(order.id, orders[1].id);
    assert.equal(order.Items.length, orders[1].Items.length);
    assert.equal(OrderConstants.Status.DECLINED, orders[1].status);
  });
});
