import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';

beforeEach(done => {
  clearDatabase().then(() => done());
});

after(() => disconnectDatabase());

describe('Restaurant', () => {
  const name = 'TestRestaurant';
  const password = '1234';
  const phoneNumber = '1234567890';
  const mode = Restaurant.Mode.REGULAR;

  const category = 'Entree';

  if (console) {
    console.log('true');
  }

  describe('#insertCategory()', () => {
    it('should insert a category for a restaurant correctly', done => {
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(restaurant => restaurant.insertCategory(category))
        .then(result => {
          assert.equal(result.name, category);
          done();
        });
    });

    it('should not insert a restaurant category with null name', async done => {
      const restaurant = Restaurant.create(name, password, mode, {phoneNumber});
      try {
        await restaurant.insertCategory(null);
      } catch (error) {
        return done();
      }

      assert(false);
      done();
    });

    it('should not insert duplicate categories', async done => {
      const restaurant = await Restaurant.create(name, password, mode, {phoneNumber});
      await restaurant.insertCategory(category);
      try {
        await restaurant.insertCategory(category);
      } catch (error) {
        return done();
      }

      assert(false);
      done();
    });
  });

  describe('#findCategories()', () => {
    it('should query categories for a restaurant correctly', done => {
      let restaurant;
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(_restaurant => restaurant = _restaurant)
        .then(() => restaurant.insertCategory(category))
        .then(() => restaurant.insertCategory('NewCategory'))
        .then(() => restaurant.findCategories())
        .then(result => {
          assert.equal(result.length, 2);
          assert.equal(result[0].name, category);
          assert.equal(result[1].name, 'NewCategory');
          done();
        });
    });
  });
});
