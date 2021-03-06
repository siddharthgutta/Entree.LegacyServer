import assert from 'assert';
import {clearDatabase} from './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';
import * as RestaurantHour from '../api/restaurantHour.es6';
import * as Location from '../api/location.es6';
import * as Category from '../api/category.es6';

beforeEach(() => clearDatabase());

describe('Restaurant', () => {
  const name = 'TestRestaurant';
  const handle = 'testrestaurant';
  const password = '1234';
  const phoneNumber = '1234567890';
  const mode = Restaurant.Mode.REGULAR;
  const merchantId = 'abc';
  const merchantApproved = true;

  const dayOfTheWeek = 'Monday';
  const openTime = '11:11:11';
  const closeTime = '12:34:56';

  const address = '1234 Main Street';
  const city = 'Houston';
  const state = 'TX';
  const zipcode = '48921';

  const category = 'Entree';

  if (console) {
    console.log('true');
  }

  describe('#create()', () => {
    it('should insert to and query from the database correctly', done => {
      Restaurant.create(name, handle, password, mode, {phoneNumber, merchantApproved, merchantId})
                .then(restaurant => {
                  assert.equal(restaurant.name, name);
                  assert.equal(restaurant.handle, handle);
                  assert.equal(restaurant.password, password);
                  assert.equal(restaurant.mode, mode);
                  assert.equal(restaurant.phoneNumber, phoneNumber);
                  assert.equal(restaurant.merchantApproved, merchantApproved);
                  assert.equal(restaurant.merchantId, merchantId);
                  done();
                });
    });

    it('should insert to and query from the database correctly' +
       'without optional params', done => {
      Restaurant.create(name, handle, password)
                .then(restaurant => {
                  assert.equal(restaurant.name, name);
                  assert.equal(restaurant.handle, handle);
                  assert.equal(restaurant.password, password);
                  assert.equal(restaurant.mode, mode);
                  done();
                });
    });

    it('should not create Restaurants that have null name, null password, null mode' +
       'or phone number of length not 10', done => {
      Restaurant.create(null, null, null, null, {phoneNumber: '123', merchantId: 'a'.repeat(33)})
                .then(() => {
                  assert(false);
                  done();
                }, err => {
                  assert.equal(err.causes().length, 7);
                  done();
                });
    });

    it('should not create Restaurant with non numeric phone number', done => {
      Restaurant.create(name, handle, password, mode, {phoneNumber: 'abcdefghij'})
                .then(() => {
                  assert(false);
                  done();
                }, err => {
                  assert.equal(err.causes().length, 2);
                  done();
                });
    });
  });

  describe('#update()', () => {
    it('should update and query from the database correctly', done => {
      let id;
      Restaurant.create(name, handle, password, mode, {phoneNumber})
                .then(result => id = result.id)
                .then(() => Restaurant.update(id, {name: 'Rest', handle: 'rest', password: 'a',
                  phoneNumber: '1234561234', merchantId: true, merchantApproved: false}))
                .then(() => Restaurant.findOne(id))
                .then(restaurant => {
                  assert.equal(restaurant.name, 'Rest');
                  assert.equal(restaurant.handle, 'rest');
                  assert.equal(restaurant.password, 'a');
                  assert.equal(restaurant.mode, mode);
                  assert.equal(restaurant.phoneNumber, '1234561234');
                  assert.equal(restaurant.merchantId, true);
                  assert.equal(restaurant.merchantApproved, false);
                  done();
                });
    });
  });

  describe('#findByHandle()', () => {
    it('should find restaurant by correct handle', done => {
      Restaurant.create(name, handle, password, mode, {phoneNumber})
        .then(() => Restaurant.findByHandle(handle))
        .then(restaurant => {
          assert.equal(restaurant.name, name);
          assert.equal(restaurant.handle, handle);
          assert.equal(restaurant.password, password);
          assert.equal(restaurant.mode, mode);
          assert.equal(restaurant.phoneNumber, phoneNumber);
          done();
        });
    });
  });

  describe('#destroy()', () => {
    it('should delete from the database correctly', async () => {
      const restaurant = await Restaurant.create(name, handle, password, mode, {phoneNumber});
      await Restaurant.destroy(restaurant.id);
      try {
        await Restaurant.findOne(restaurant.id);
      } catch (err) {
        return;
      }

      assert(false);
    });

    it('should cascade delete location when deleting restaurant', async () => {
      const restaurant = (await Restaurant.create(name, handle, password, mode, {phoneNumber})).resolve();
      await restaurant.upsertLocation(address, city, state, zipcode);
      await Restaurant.destroy(restaurant.id);
      const result = await Location.findAll();
      assert.equal(result.length, 0);
    });

    it('should cascade delete restaurant hours when deleting restaurant', async () => {
      const restaurant = (await Restaurant.create(name, handle, password, mode, {phoneNumber})).resolve();
      await restaurant.addHour(dayOfTheWeek, openTime, closeTime);
      await Restaurant.destroy(restaurant.id);
      const result = await RestaurantHour.findAll();
      assert.equal(result.length, 0);
    });

    it('should cascade delete categories when deleting restaurant', async () => {
      const restaurant = (await Restaurant.create(name, handle, password, mode, {phoneNumber})).resolve();
      await restaurant.insertCategory(category);
      await Restaurant.destroy(restaurant.id);
      const result = await Category.findAll();
      assert.equal(result.length, 0);
    });
  });
});
