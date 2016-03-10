import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';

let globalMenuItem;

describe('ItemMod', () => {
  const name = 'TestRestaurant';
  const password = '1234';
  const phoneNumber = '1234567890';
  const mode = Restaurant.Mode.REGULAR;

  const categoryName = 'Entree';

  const itemName = 'Noodles';
  const description = 'Yummy!';
  const basePrice = 500;

  const itemModName = 'Xtra Chz';
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

  describe('#upsertItemMod()', () => {
    it('should insert item mode correctly', done => {
      globalMenuItem.upsertItemMod(itemModName, addPrice)
        .then(size => {
          assert.equal(size.name, itemModName);
          assert.equal(size.addPrice, addPrice);
          done();
        });
    });

    it('should not insert a size with null name', done => {
      globalMenuItem.upsertItemMod(null, addPrice)
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
      globalMenuItem.upsertItemMod(itemModName, null)
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

  describe('#findItemMods()', () => {
    it('should find sizes correctly', done => {
      globalMenuItem.upsertItemMod(itemModName, addPrice)
        .then(() => globalMenuItem.upsertItemMod('Xtra Mayo', addPrice))
        .then(() => globalMenuItem.findItemMods())
        .then(result => {
          assert.equal(result.length, 2);
          assert.equal(result[0].name, itemModName);
          assert.equal(result[0].addPrice, addPrice);
          assert.equal(result[1].name, 'Xtra Mayo');
          assert.equal(result[1].addPrice, addPrice);
          done();
        });
    });
  });
});
