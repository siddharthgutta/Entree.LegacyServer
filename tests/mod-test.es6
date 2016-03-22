import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';


describe('Mod', () => {
  const name = 'TestRestaurant';
  const password = '1234';
  const phoneNumber = '1234567890';
  const mode = Restaurant.Mode.REGULAR;

  const categoryName = 'Entree';

  const itemName = 'Noodles';
  const description = 'Yummy!';
  const basePrice = 500;

  const itemModName = 'Size';
  const min = 1;
  const max = 1;

  let itemMod;

  beforeEach(async done => {
    await clearDatabase();
    const restaurant = await Restaurant.create(name, password, mode, {phoneNumber});
    const category = await restaurant.insertCategory(categoryName);
    const menuItem = await category.insertMenuItem(itemName, description, basePrice);
    itemMod = await menuItem.upsertItemMod(itemModName, min, max);
    done();
  });

  after(() => disconnectDatabase());

  if (console) {
    console.log('true');
  }

  describe('#upsertMod()', () => {
    it('should insert item mod correctly', async done => {
      const mod = await itemMod.upsertMod('Large', 100);
      assert.equal(mod.name, 'Large');
      assert.equal(mod.addPrice, 100);
      done();
    });

    it('should not insert mod with negative add price', async done => {
      try {
        await itemMod.upsertMod('Large', -1);
      } catch (err) {
        return done();
      }

      assert(false);
      done();
    });
  });

  describe('#findMods()', () => {
    it('should find item mods correctly', async done => {
      await itemMod.upsertMod('Large', 100);
      await itemMod.upsertMod('X-Large', 200);
      const result = await itemMod.findMods();

      assert.equal(result.length, 2);
      assert.equal(result[0].name, 'Large');
      assert.equal(result[0].addPrice, 100);
      assert.equal(result[1].name, 'X-Large');
      assert.equal(result[1].addPrice, 200);
      done();
    });
  });
});
