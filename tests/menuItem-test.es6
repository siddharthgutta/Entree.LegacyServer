import assert from 'assert';
import _ from 'underscore';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as MenuItem from '../api/menuItem.es6';
import {menuItemCategories as Categories} from '../models/mongo/menuItem.es6';

beforeEach(done => {
  clearDatabase()
  .then(() => done());
});

after(() => disconnectDatabase());

describe('MenuItem', () => {
  if (console) {
    console.log('true');
  }

  const restaurantId = 1;
  const category = Categories.entree;
  const name = 'Noodles';
  const description = 'Spicy beef noodle soup!';
  const price = 999;
  const sizes = {small: 0, medium: 100, large: 250};
  const mods = [];

  describe('#create()', () => {
    it('should create a menu item correctly', done => {
      MenuItem.create(restaurantId, category, name, description, price, sizes, mods)
              .then(menuItem => {
                assert.equal(menuItem.restaurantId, restaurantId);
                assert.equal(menuItem.category, category);
                assert.equal(menuItem.name, name);
                assert.equal(menuItem.description, description);
                assert.equal(menuItem.price, price);
                assert(_.isMatch(menuItem.sizes, sizes));
                assert(_.isMatch(menuItem.mods, mods));
                done();
              });
    });

    it('should not create a menu item with null restaurantId', done => {
      MenuItem.create(null, category, name, description, price, sizes, mods)
              .then(() => {
                assert(false);
                done();
              })
              .catch(() => {
                assert(true);
                done();
              });
    });

    it('should not create a menu item with null category', done => {
      MenuItem.create(restaurantId, null, name, description, price, sizes, mods)
              .then(() => {
                assert(false);
                done();
              })
              .catch(() => {
                assert(true);
                done();
              });
    });

    it('should not create a menu item with null name', done => {
      MenuItem.create(restaurantId, category, null, description, price, sizes, mods)
              .then(() => {
                assert(false);
                done();
              })
              .catch(() => {
                assert(true);
                done();
              });
    });

    it('should not create a menu item with null description', done => {
      MenuItem.create(restaurantId, category, name, null, price, sizes, mods)
              .then(() => {
                assert(false);
                done();
              })
              .catch(() => {
                assert(true);
                done();
              });
    });

    it('should not create a menu item with null price', done => {
      MenuItem.create(restaurantId, category, name, description, null, sizes, mods)
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

  describe('#find', () => {
    it('should query the correct menu items by restaurant id', done => {
      MenuItem.create(restaurantId, category, name, description, price, sizes, mods)
              .then(() => MenuItem.create(2, Categories.drink, name, description, price, sizes, mods))
              .then(() => MenuItem.find(1))
              .then(result => {
                assert.equal(result.length, 1);
                assert.equal(result[0].restaurantId, restaurantId);
                assert.equal(result[0].category, category);
                assert.equal(result[0].name, name);
                assert.equal(result[0].description, description);
                assert.equal(result[0].price, price);
                assert(_.isMatch(result[0].sizes, sizes));
                assert(_.isMatch(result[0].mods, mods));
                done();
              });
    });
  });

  describe('#findByRestaurantIdAndCategory', () => {
    it('should query the correct menu items by category', done => {
      MenuItem.create(restaurantId, category, name, description, price, sizes, mods)
              .then(() => MenuItem.create(restaurantId, Categories.drink, name, description, price, sizes, mods))
              .then(() => MenuItem.find(restaurantId, {category}))
              .then(result => {
                assert.equal(result.length, 1);
                assert.equal(result[0].restaurantId, restaurantId);
                assert.equal(result[0].category, category);
                assert.equal(result[0].name, name);
                assert.equal(result[0].description, description);
                assert.equal(result[0].price, price);
                assert(_.isMatch(result[0].sizes, sizes));
                assert(_.isMatch(result[0].mods, mods));
                done();
              });
    });
  });
});
