import assert from 'assert';
import {clearDatabase} from './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';

let globalMenuItem;

describe('ItemMod', () => {
  const name = 'TestRestaurant';
  const handle = 'testrestaurant';
  const password = '1234';
  const phoneNumber = '1234567890';
  const mode = Restaurant.Mode.REGULAR;

  const categoryName = 'Entree';

  const itemName = 'Noodles';
  const description = 'Yummy!';
  const basePrice = 500;

  beforeEach(async done => {
    await clearDatabase();
    const restaurant = (await Restaurant.create(name, handle, password, mode, {phoneNumber})).resolve();
    const category = await restaurant.insertCategory(categoryName);
    globalMenuItem = await category.insertMenuItem(itemName, description, basePrice);
    done();
  });

  if (console) {
    console.log('true');
  }

  describe('#upsertItemMod()', () => {
    it('should insert item mod correctly with min less than max', async () => {
      const itemMod = await globalMenuItem.upsertItemMod('Sizes', 0, 1);
      assert.equal(itemMod.name, 'Sizes');
      assert.equal(itemMod.min, 0);
      assert.equal(itemMod.max, 1);
    });

    it('should insert item mod correctly with min equal to max', async () => {
      const itemMod = await globalMenuItem.upsertItemMod('Sizes', 1, 1);
      assert.equal(itemMod.name, 'Sizes');
      assert.equal(itemMod.min, 1);
      assert.equal(itemMod.max, 1);
    });

    it('should not insert item mod with max less than 1', async () => {
      try {
        await globalMenuItem.upsertItemMod('Sizes', 0, 0);
      } catch (err) {
        return;
      }

      assert(false);
    });

    it('should not insert item mod with min less than 0', async () => {
      try {
        await globalMenuItem.upsertItemMod('Sizes', -1, 1);
      } catch (err) {
        return;
      }

      assert(false);
    });

    it('should not insert item mod with max less than min', async () => {
      try {
        await globalMenuItem.upsertItemMod('Sizes', 2, 1);
      } catch (err) {
        return;
      }

      assert(false);
    });
  });

  describe('#findItemMods()', () => {
    it('should find item mods correctly', async () => {
      await globalMenuItem.upsertItemMod('Sizes', 1, 1);
      await globalMenuItem.upsertItemMod('Meats', 0, 2);

      const result = await globalMenuItem.findItemMods();
      assert.equal(result.length, 2);
      assert.equal(result[0].name, 'Sizes');
      assert.equal(result[0].min, 1);
      assert.equal(result[0].max, 1);

      assert.equal(result[1].name, 'Meats');
      assert.equal(result[1].min, 0);
      assert.equal(result[1].max, 2);
    });
  });
});
