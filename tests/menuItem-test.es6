import assert from 'assert';
import _ from 'underscore';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as MenuItem from '../api/menuItem.es6';
import Categories from '../models/mongo/menuItemCategories.es6';

beforeEach(done => {
  clearDatabase().then(() => done());
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
  const hasSize = true;
  const sizes = {small: 0, medium: 100, large: 250};
  const mods = {};

  function createItem() {
    return MenuItem.create(
      restaurantId,
      category,
      name,
      description,
      price,
      hasSize,
      sizes,
      mods);
  }

  describe('#create()', () => {
    it('should create a menu item correctly', done => {
      createItem().then(menuItem => {
        assert.equal(menuItem.restaurantId, restaurantId);
        assert.equal(menuItem.category, category);
        assert.equal(menuItem.name, name);
        assert.equal(menuItem.description, description);
        assert.equal(menuItem.price, price);
        assert.equal(menuItem.hasSize, hasSize);
        assert(_.isMatch(menuItem.sizes, sizes));
        assert(_.isMatch(menuItem.mods, mods));
        done();
      });
    });
  });

  describe('#find', () => {
    it('should query the correct menu items by restaurant id', done => {
      createItem().then(() => {
        MenuItem.create(
          2,
          category,
          name,
          description,
          price,
          hasSize,
          sizes,
          mods).then(() => {
            MenuItem.find(1).then(result => {
              assert.equal(result.length, 1);
              assert.equal(result[0].restaurantId, restaurantId);
              assert.equal(result[0].category, category);
              assert.equal(result[0].name, name);
              assert.equal(result[0].description, description);
              assert.equal(result[0].price, price);
              assert.equal(result[0].hasSize, hasSize);
              assert(_.isMatch(result[0].sizes, sizes));
              assert(_.isMatch(result[0].mods, mods));
              done();
            });
          });
      });
    });
  });

  describe('#findByRestaurantIdAndCategory', () => {
    it('should query the correct menu items by category', done => {
      createItem().then(() => {
        MenuItem.create(
          restaurantId,
          Categories.drink,
          name,
          description,
          price,
          hasSize,
          sizes,
          mods).then(() => {
            MenuItem.find(restaurantId, {category}).then(result => {
              assert.equal(result.length, 1);
              assert.equal(result[0].restaurantId, restaurantId);
              assert.equal(result[0].category, category);
              assert.equal(result[0].name, name);
              assert.equal(result[0].description, description);
              assert.equal(result[0].price, price);
              assert.equal(result[0].hasSize, hasSize);
              assert(_.isMatch(result[0].sizes, sizes));
              assert(_.isMatch(result[0].mods, mods));
              done();
            });
          });
      });
    });
  });
});
