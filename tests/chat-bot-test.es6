import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import {DefaultChatBot, chatStates} from '../libs/chat-bot/index.es6';
import * as User from '../api/user.es6';
import * as Restaurant from '../api/restaurant.es6';

describe('ChatBot', () => {
  const bot = new DefaultChatBot();

  const restaurantName = 'TestRestaurant';
  const password = '1234';
  const mode = Restaurant.Mode.REGULAR;

  const address = '1234 Main Street';
  const city = 'Houston';
  const addrState = 'TX';
  const zipcode = '48921';

  const name = 'TestUser';
  const email = 'TestUser@gmail.com';
  const phoneNumber = '1234567890';

  const dayOfTheWeek = 'Monday';
  const openTime = '11:11:11';
  const closeTime = '12:34:56';

  const menuItemName = 'Noodles';
  const description = 'Delicious noodles';
  const basePrice = 500;

  const size = 'Small';
  const mod = 'Extra Mayo';
  const addPrice = 100;

  async function setupRestaurant() {
    const restaurant = await Restaurant.create(restaurantName, password, mode, {phoneNumber});
    await restaurant.upsertLocation(address, city, addrState, zipcode);
    await restaurant.addOrUpdateHour(dayOfTheWeek, openTime, closeTime);

    const category = await restaurant.insertCategory('Entrees');
    await category.insertMenuItem(menuItemName, description, basePrice);

    const menuItem = (await category.findMenuItems())[0];
    await menuItem.upsertSize(size, addPrice);
    await menuItem.upsertItemMod(mod, addPrice);
  }

  async function destroyMods() {
    const restaurant = await Restaurant.findByName(restaurantName);
    const categories = await restaurant.findCategories();
    const menuItems = await categories[0].findMenuItems(0);
    const itemMods = await menuItems[0].findItemMods();
    await itemMods[0].destroy();
  }

  async function destroySize() {
    const restaurant = await Restaurant.findByName(restaurantName);
    const categories = await restaurant.findCategories();
    const menuItems = await categories[0].findMenuItems(0);
    const sizes = await menuItems[0].findSizes();
    await sizes[0].destroy();
  }

  async function checkState(state) {
    const user = await User.findOneByPhoneNumber(phoneNumber);
    const chatState = await user.findChatState();
    assert.equal(chatState.state, state);
  }

  async function checkCtx(restName, itemName) {
    const user = await User.findOneByPhoneNumber(phoneNumber);
    const chatState = await user.findChatState();
    const restCtx = await chatState.findRestaurantCtx();
    const menuItemCtx = await chatState.findMenuItemCtx();
    if (restName) {
      assert.equal(restCtx.name, restaurantName);
    } else {
      assert.equal(restCtx, null);
    }

    if (itemName) {
      assert.equal(menuItemCtx.name, itemName);
    } else {
      assert.equal(menuItemCtx, null);
    }
  }

  beforeEach(done => {
    clearDatabase()
      .then(() => setupRestaurant())
      .then(() => done());
  });

  after(() => disconnectDatabase());

  if (console) {
    console.log('true');
  }

  describe('#updateState() for stateless commands', () => {
    beforeEach(done => {
      User.create(phoneNumber, name, email)
        .then(user => user.insertChatState(chatStates.start))
        .then(() => done());
    });

    it('should not change state using the \"help\" command', async done => {
      await bot.updateState(phoneNumber, 'help');
      await checkState(chatStates.start);
      await checkCtx(null, null);
      done();
    });

    it('should not change state using the \"@<restaurant> info\" command', async done => {
      await bot.updateState(phoneNumber, `@${restaurantName} info`);
      await checkState(chatStates.start);
      await checkCtx(null, null);
      done();
    });

    it('should change to the restaurant state after typing \"restaurants\"', async done => {
      await bot.updateState(phoneNumber, `restaurants`);
      await checkState(chatStates.restaurants);
      await checkCtx(null, null);
      done();
    });

    it('should change to the categories state after typing \"@<restaurant> menu\"', async done => {
      await bot.updateState(phoneNumber, `@${restaurantName} menu`);
      await checkState(chatStates.categories);
      await checkCtx(restaurantName, null);

      done();
    });

    it('should change to the items state after typing \"@<restaurant>\"', async done => {
      await bot.updateState(phoneNumber, `@${restaurantName}`);
      await checkState(chatStates.items);
      await checkCtx(restaurantName, null);

      done();
    });

    it('should not checkout with an empty cart', async done => {
      const result = await bot.updateState(phoneNumber, 'checkout');
      assert.equal(result, 'You can\'t checkout with an empty cart');
      await checkState(chatStates.start);
      await checkCtx(null, null);

      done();
    });
  });

  describe('#updateState() from the restaurants state', () => {
    beforeEach(done => {
      User.create(phoneNumber, name, email)
        .then(user => user.insertChatState(chatStates.start))
        .then(() => bot.updateState(phoneNumber, 'restaurants'))
        .then(() => done());
    });

    it('should change to items state when selecting a restaurant', async done => {
      await bot.updateState(phoneNumber, '0');
      await checkState(chatStates.items);
      await checkCtx(restaurantName, null);

      done();
    });

    it('should stay the same state when asking for more restaurants', done => {
      bot.updateState(phoneNumber, 'more')
        .then(() => User.findOneByPhoneNumber(phoneNumber))
        .then(user => user.findChatState())
        .then(chatState => {
          assert.equal(chatState.state, chatStates.restaurants);
          done();
        });
    });
  });

  describe('#updateState() from the categories state', () => {
    beforeEach(done => {
      User.create(phoneNumber, name, email)
        .then(user => user.insertChatState(chatStates.start))
        .then(() => bot.updateState(phoneNumber, `@${restaurantName} menu`))
        .then(() => done());
    });

    it('should change to items state when selecting a category', async done => {
      await bot.updateState(phoneNumber, '0');
      await checkState(chatStates.items);
      await checkCtx(restaurantName, null);

      done();
    });

    it('should not change states using the help command', async done => {
      await bot.updateState(phoneNumber, 'help');
      await checkState(chatStates.categories);
      await checkCtx(restaurantName, null);
      done();
    });

    it('should not change states using the info command', async done => {
      await bot.updateState(phoneNumber, 'info');
      await checkState(chatStates.categories);
      await checkCtx(restaurantName, null);
      done();
    });

    it('should switch to the categories state using menu command', async done => {
      await bot.updateState(phoneNumber, 'menu');
      await checkState(chatStates.categories);
      await checkCtx(restaurantName, null);
      done();
    });

    it('should stay in the same state using clear command', async done => {
      await bot.updateState(phoneNumber, 'clear');
      await checkState(chatStates.categories);
      await checkCtx(restaurantName, null);
      done();
    });
  });

  describe('#updateState() from the items state', () => {
    beforeEach(done => {
      User.create(phoneNumber, name, email)
        .then(user => user.insertChatState(chatStates.start))
        .then(() => bot.updateState(phoneNumber, `@${restaurantName}`))
        .then(() => done());
    });

    it('should change to size state if there is a size', async done => {
      await bot.updateState(phoneNumber, '0');
      await checkState(chatStates.size);
      await checkCtx(restaurantName, menuItemName);

      done();
    });

    it('item select should change to mod state if no size and there are mods', async done => {
      await destroySize();
      await bot.updateState(phoneNumber, '0');

      await checkState(chatStates.mods);
      await checkCtx(restaurantName, menuItemName);

      done();
    });

    it('item select should change to cart state if no size and there are mods', async done => {
      await destroyMods();
      await destroySize();

      await bot.updateState(phoneNumber, '0');
      await checkState(chatStates.cart);
      await checkCtx(restaurantName, null);

      done();
    });

    it('should not change states using the help command', async done => {
      await bot.updateState(phoneNumber, 'help');
      await checkState(chatStates.items);
      await checkCtx(restaurantName, null);
      done();
    });

    it('should not change states using the info command', async done => {
      await bot.updateState(phoneNumber, 'info');
      await checkState(chatStates.items);
      await checkCtx(restaurantName, null);
      done();
    });

    it('should switch to the categories state using menu command', async done => {
      await bot.updateState(phoneNumber, 'menu');
      await checkState(chatStates.categories);
      await checkCtx(restaurantName, null);
      done();
    });
  });

  describe('#updateState() from the size state', () => {
    beforeEach(done => {
      User.create(phoneNumber, name, email)
        .then(user => user.insertChatState(chatStates.start))
        .then(() => bot.updateState(phoneNumber, `@${restaurantName}`))
        .then(() => bot.updateState(phoneNumber, '0'))
        .then(() => done());
    });

    it('should change to mod state if there are item mods', async done => {
      await bot.updateState(phoneNumber, '0');
      await checkState(chatStates.mods);
      await checkCtx(restaurantName, menuItemName);

      done();
    });

    it('should change to cart state if there are no mods', async done => {
      await destroyMods();

      await bot.updateState(phoneNumber, '0');
      await checkState(chatStates.cart);
      await checkCtx(restaurantName, null);

      done();
    });

    it('should stay in the same state using the menu command. Menu is not allowed', async done => {
      const result = await bot.updateState(phoneNumber, 'menu');
      assert.equal(result, 'Please finish ordering your item before doing that');
      await checkState(chatStates.size);
      await checkCtx(restaurantName, menuItemName);
      done();
    });
  });

  describe('#updateState() from the mods state', () => {
    beforeEach(done => {
      User.create(phoneNumber, name, email)
        .then(user => user.insertChatState(chatStates.start))
        .then(() => bot.updateState(phoneNumber, `@${restaurantName}`))
        .then(() => bot.updateState(phoneNumber, '0'))
        .then(() => bot.updateState(phoneNumber, '0'))
        .then(() => done());
    });

    it('should change state to the cart state after selecting a mod', async done => {
      await bot.updateState(phoneNumber, '0');
      await checkState(chatStates.cart);
      await checkCtx(restaurantName, null);

      done();
    });

    it('should stay in the same state using the menu command. Menu is not allowed', async done => {
      const result = await bot.updateState(phoneNumber, 'menu');
      assert.equal(result, 'Please finish ordering your item before doing that');
      await checkState(chatStates.mods);
      await checkCtx(restaurantName, menuItemName);
      done();
    });
  });

  describe('#_isContextual()', () => {
    it('should determine the correct commands to be context commands', done => {
      assert.equal(bot._isContextual('checkout'), true);
      assert.equal(bot._isContextual('menu'), true);
      assert.equal(bot._isContextual('info'), true);
      done();
    });
  });

  describe('#_isStateless()', () => {
    it('should determine the correct commands to be stateless commands', done => {
      assert.equal(bot._isStateless('restaurants'), true);
      assert.equal(bot._isStateless('clear'), true);
      assert.equal(bot._isStateless('help'), true);
      assert.equal(bot._isStateless('@name'), true);
      assert.equal(bot._isStateless('@name menu'), true);
      assert.equal(bot._isStateless('@name info'), true);
      done();
    });
  });
});
