import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';

let globalCategory;

describe('MenuItem', () => {
  const name = 'TestRestaurant';
  const password = '1234';
  const phoneNumber = '1234567890';
  const mode = Restaurant.Mode.REGULAR;

  const categoryName = 'Entree';

  const itemName = 'Noodles';
  const description = 'Yummy!';
  const basePrice = 500;

  beforeEach(async () => {
    await clearDatabase();
    const restaurant = (await Restaurant.create(name, password, mode, {phoneNumber})).resolve();
    globalCategory = await restaurant.insertCategory(categoryName);
  });

  after(() => disconnectDatabase());

  if (console) {
    console.log('true');
  }

  describe('#insertMenuItem()', () => {
    it('should insert menu items correctly', done => {
      globalCategory.insertMenuItem(itemName, description, basePrice)
                .then(menuItem => {
                  assert.equal(menuItem.name, itemName);
                  assert.equal(menuItem.description, description);
                  assert.equal(menuItem.basePrice, basePrice);
                  done();
                });
    });

    it('should not insert menu item with null name', done => {
      globalCategory.insertMenuItem(null, description, basePrice)
                .then(() => {
                  assert(false);
                  done();
                })
                .catch(() => {
                  assert(true);
                  done();
                });
    });

    it('should not insert menu item with null description', done => {
      globalCategory.insertMenuItem(itemName, null, basePrice)
                    .then(() => {
                      assert(false);
                      done();
                    })
                    .catch(() => {
                      assert(true);
                      done();
                    });
    });

    it('should not insert menu item with null base price', done => {
      globalCategory.insertMenuItem(itemName, description, null)
                    .then(() => {
                      assert(false);
                      done();
                    })
                    .catch(() => {
                      assert(true);
                      done();
                    });
    });
  });

  describe('#findMenuItems()', () => {
    it('should find menu items correctly', done => {
      globalCategory.insertMenuItem(itemName, description, basePrice)
                    .then(() => globalCategory.insertMenuItem('Another one', description, basePrice))
                    .then(() => globalCategory.findMenuItems())
                    .then(result => {
                      assert.equal(result.length, 2);
                      assert.equal(result[0].name, itemName);
                      assert.equal(result[0].description, description);
                      assert.equal(result[0].basePrice, basePrice);

                      assert.equal(result[1].name, 'Another one');
                      assert.equal(result[0].description, description);
                      assert.equal(result[0].basePrice, basePrice);
                      done();
                    });
    });
  });
});
