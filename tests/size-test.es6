import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';

let globalMenuItem;

describe('Size', () => {
  const name = 'TestRestaurant';
  const password = '1234';
  const phoneNumber = '1234567890';
  const mode = Restaurant.Mode.REGULAR;

  const categoryName = 'Entree';

  const itemName = 'Noodles';
  const description = 'Yummy!';
  const basePrice = 500;

  const sizeName = 'Small';
  const addPrice = 100;

  beforeEach(done => {
    clearDatabase()
      .then(() => Restaurant.create(name, password, mode, {phoneNumber}))
      .then(restaurant => restaurant.insertCategory(categoryName))
      .then(category => category.insertMenuItem(itemName, description, basePrice))
      .then(_menuItem => globalMenuItem = _menuItem)
      .then(() => done());
  });

  after(() => disconnectDatabase());

  if (console) {
    console.log('true');
  }

  describe('#upsertSize()', () => {
    it('should insert size correctly', done => {
      globalMenuItem.upsertSize(sizeName, addPrice)
                    .then(size => {
                      assert.equal(size.name, sizeName);
                      assert.equal(size.addPrice, addPrice);
                      done();
                    });
    });

    it('should not insert a size with null name', done => {
      globalMenuItem.upsertSize(null, addPrice)
                    .then(() => {
                      assert(false);
                      done();
                    })
                    .catch(() => {
                      assert(true);
                      done();
                    });
    });

    it('should not insert a size with null addPrice', done => {
      globalMenuItem.upsertSize(sizeName, null)
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

  describe('#findSizes()', () => {
    it('should find sizes correctly', done => {
      globalMenuItem.upsertSize(sizeName, addPrice)
                    .then(() => globalMenuItem.upsertSize('Large', addPrice))
                    .then(() => globalMenuItem.findSizes())
                    .then(result => {
                      assert.equal(result.length, 2);
                      assert.equal(result[0].name, sizeName);
                      assert.equal(result[0].addPrice, addPrice);
                      assert.equal(result[1].name, 'Large');
                      assert.equal(result[1].addPrice, addPrice);
                      done();
                    });
    });
  });
});
