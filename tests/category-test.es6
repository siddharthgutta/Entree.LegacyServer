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

  let restaurant;
  beforeEach(async () => {
    restaurant = (await Restaurant.create(name, password, mode, {phoneNumber})).resolve();
  });

  describe('#insertCategory()', () => {
    it('should insert a category for a restaurant correctly', async () => {
      const result = await restaurant.insertCategory(category);
      assert.equal(result.name, category);
    });

    it('should not insert a restaurant category with null name', async done => {
      try {
        await restaurant.insertCategory(null);
      } catch (error) {
        return done();
      }

      assert(false);
      done();
    });

    it('should not insert duplicate categories', async done => {
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
    it('should query categories for a restaurant correctly', async () => {
      await restaurant.insertCategory(category);
      await restaurant.insertCategory('NewCategory');

      const result = await restaurant.findCategories();
      assert.equal(result.length, 2);
      assert.equal(result[0].name, category);
      assert.equal(result[1].name, 'NewCategory');
    });
  });
});
