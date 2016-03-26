import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import {DefaultChatBot, chatStates, response} from '../libs/chat-bot/index.es6';
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

  const itemModName = 'Size';
  const min = 1;
  const max = 1;

  const modName = 'Large';
  const addPrice = 100;

  /* Creates a restaurant that has location, restaurant hours, a single category that has a single /menu item
   * which has two modifications */
  async function setupRestaurant() {
    const restaurant = (await Restaurant.create(restaurantName, password, mode, {phoneNumber})).resolve();
    await restaurant.upsertLocation(address, city, addrState, zipcode);
    await restaurant.addHour(dayOfTheWeek, openTime, closeTime);

    const category = await restaurant.insertCategory('Entree');
    await category.insertMenuItem(menuItemName, description, basePrice);

    const menuItem = (await category.findMenuItems())[0];
    let itemMod = await menuItem.upsertItemMod(itemModName, min, max);
    await itemMod.upsertMod(modName, addPrice);

    itemMod = await menuItem.upsertItemMod(`${itemModName}_2`, min, max);
    await itemMod.upsertMod(modName, addPrice);
  }

  /* Destroys both modifications for the /menu item */
  async function destroyMods() {
    const restaurant = (await Restaurant.findByName(restaurantName)).resolve();
    const categories = await restaurant.findCategories();
    const menuItems = await categories[0].findMenuItems(0);
    const itemMods = await menuItems[0].findItemMods();
    await itemMods[0].destroy();
    await itemMods[1].destroy();
  }

  async function checkState(state) {
    const user = await User.findOneByPhoneNumber(phoneNumber);
    const chatState = await user.findChatState();
    assert.equal(chatState.state, state);
  }

  async function checkContext(restName, itemName) {
    const user = await User.findOneByPhoneNumber(phoneNumber);
    const chatState = await user.findChatState();
    const restContext = await chatState.findRestaurantContext();
    const menuItemContext = await chatState.findMenuItemContext();
    if (restName) {
      assert.notEqual(restContext, null);
      assert.equal(restContext.name, restaurantName);
    } else {
      assert.equal(restContext, null);
    }

    if (itemName) {
      assert.notEqual(menuItemContext, null);
      assert.equal(menuItemContext.name, itemName);
    } else {
      assert.equal(menuItemContext, null);
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

    it('should not change state using the \"/help\" command', async done => {
      await bot.updateState(phoneNumber, '/help');
      await checkState(chatStates.start);
      await checkContext(null, null);
      done();
    });

    it('should not change state using the \"@<restaurant> info\" command', async done => {
      await bot.updateState(phoneNumber, `@${restaurantName} info`);
      await checkState(chatStates.start);
      await checkContext(null, null);
      done();
    });

    it('should change to the restaurant state after typing \"/r\"', async done => {
      await bot.updateState(phoneNumber, `/r`);
      await checkState(chatStates.restaurants);
      await checkContext(null, null);
      done();
    });

    it('should change to the categories state after typing \"@<restaurant> menu\"', async done => {
      await bot.updateState(phoneNumber, `@${restaurantName} menu`);
      await checkState(chatStates.categories);
      await checkContext(restaurantName, null);

      done();
    });

    it('should change to the items state after typing \"@<restaurant>\"', async done => {
      await bot.updateState(phoneNumber, `@${restaurantName}`);
      await checkState(chatStates.items);
      await checkContext(restaurantName, null);

      done();
    });

    it('should not /checkout while not in restaurant context', async done => {
      const result = await bot.updateState(phoneNumber, '/checkout');
      assert.equal(result, response.invalidContext);
      await checkState(chatStates.start);
      await checkContext(null, null);

      done();
    });

    it('should respond to the user with an error given an invalid command', async done => {
      const result = await bot.updateState(phoneNumber, 'not a command');
      assert.equal(result, response.userError);
      await checkState(chatStates.start);
      await checkContext(null, null);

      done();
    });

    it('should not be able to use /info context command while not in restaurant context', async done => {
      const result = await bot.updateState(phoneNumber, '/info');
      assert.equal(result, response.invalidContext);
      await checkState(chatStates.start);
      await checkContext(null, null);
      done();
    });

    it('should not be able to use \"/menu\" context command while not in restaurant context', async done => {
      const result = await bot.updateState(phoneNumber, '/menu');
      assert.equal(result, response.invalidContext);
      await checkState(chatStates.start);
      await checkContext(null, null);
      done();
    });

    it('should not be able to use <category> context command while not in restaurant context', async done => {
      const result = await bot.updateState(phoneNumber, 'Entree');
      assert.equal(result, response.userError);
      await checkState(chatStates.start);
      await checkContext(null, null);
      done();
    });
  });

  describe('#updateState() from the restaurants state', () => {
    beforeEach(done => {
      User.create(phoneNumber, name, email)
        .then(user => user.insertChatState(chatStates.start))
        .then(() => bot.updateState(phoneNumber, '/r'))
        .then(() => done());
    });

    it('should change to items state when selecting a restaurant', async done => {
      await bot.updateState(phoneNumber, '1');
      await checkState(chatStates.items);
      await checkContext(restaurantName, null);

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

    it('should respond to the user with an error given an invalid command', async done => {
      const result = await bot.updateState(phoneNumber, 'not a command');
      assert.equal(result, response.userError);
      await checkState(chatStates.restaurants);
      await checkContext(null, null);

      done();
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
      await bot.updateState(phoneNumber, '1');
      await checkState(chatStates.items);
      await checkContext(restaurantName, null);

      done();
    });

    it('should not change states using the /info command', async done => {
      await bot.updateState(phoneNumber, '/info');
      await checkState(chatStates.categories);
      await checkContext(restaurantName, null);
      done();
    });

    it('should switch to the categories state using /menu command', async done => {
      await bot.updateState(phoneNumber, '/menu');
      await checkState(chatStates.categories);
      await checkContext(restaurantName, null);
      done();
    });

    it('should stay in the same state using /clear command', async done => {
      await bot.updateState(phoneNumber, '/clear');
      await checkState(chatStates.categories);
      await checkContext(restaurantName, null);
      done();
    });

    it('should respond to the user with an error given an invalid command', async done => {
      const result = await bot.updateState(phoneNumber, 'not a command');
      assert.equal(result, response.userError);
      await checkState(chatStates.categories);
      await checkContext(restaurantName, null);

      done();
    });

    it('should go back to the items state given a <category>', async done => {
      await bot.updateState(phoneNumber, 'Entree');
      await checkState(chatStates.items);
      await checkContext(restaurantName, null);
      done();
    });

    it('should not checkout with empty cart', async done => {
      const result = await bot.updateState(phoneNumber, '/checkout');
      assert.equal(result, response.invalidCheckout);
      await checkState(chatStates.categories);
      await checkContext(restaurantName, null);

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

    it('should change to mods state if there is a mod', async done => {
      await bot.updateState(phoneNumber, '1');

      await checkState(chatStates.mods);
      await checkContext(restaurantName, menuItemName);

      done();
    });

    it('item select should change to cart state if no size and there are mods', async done => {
      await destroyMods();

      await bot.updateState(phoneNumber, '1');
      await checkState(chatStates.cart);
      await checkContext(restaurantName, null);

      done();
    });

    it('should switch to the categories state using /menu command', async done => {
      await bot.updateState(phoneNumber, '/menu');
      await checkState(chatStates.categories);
      await checkContext(restaurantName, null);
      done();
    });

    it('should not change states using the /info command', async done => {
      await bot.updateState(phoneNumber, '/info');
      await checkState(chatStates.items);
      await checkContext(restaurantName, null);
      done();
    });

    it('should go back to the items state given a <category>', async done => {
      await bot.updateState(phoneNumber, 'entree');
      await checkState(chatStates.items);
      await checkContext(restaurantName, null);
      done();
    });

    it('should not checkout with empty cart', async done => {
      const result = await bot.updateState(phoneNumber, '/checkout');
      assert.equal(result, response.invalidCheckout);
      await checkState(chatStates.items);
      await checkContext(restaurantName, null);

      done();
    });
  });

  describe('#updateState() from the mods state', () => {
    beforeEach(done => {
      User.create(phoneNumber, name, email)
        .then(user => user.insertChatState(chatStates.start))
        .then(() => bot.updateState(phoneNumber, `@${restaurantName}`))
        .then(() => bot.updateState(phoneNumber, '1'))
        .then(() => done());
    });

    it('should change state to the cart state after selecting mods', async done => {
      await bot.updateState(phoneNumber, '1');
      await bot.updateState(phoneNumber, '1');
      await checkState(chatStates.cart);
      await checkContext(restaurantName, null);

      done();
    });

    it('should not allow /menu command while selecting item mods', async done => {
      const result = await bot.updateState(phoneNumber, '/menu');
      assert.equal(result, response.finishItem);
      await checkState(chatStates.mods);
      await checkContext(restaurantName, menuItemName);
      done();
    });

    it('should not allow <category> command while selecting item mods', async done => {
      const result = await bot.updateState(phoneNumber, 'entree');
      assert.equal(result, response.finishItem);
      await checkState(chatStates.mods);
      await checkContext(restaurantName, menuItemName);
      done();
    });


    it('should not allow /info command when selecting item mods', async done => {
      const result = await bot.updateState(phoneNumber, 'entree');
      assert.equal(result, response.finishItem);
      await checkState(chatStates.mods);
      await checkContext(restaurantName, menuItemName);
      done();
    });

    it('should not checkout while selecting item mods', async done => {
      const result = await bot.updateState(phoneNumber, '/checkout');
      assert.equal(result, response.finishItem);
      await checkState(chatStates.mods);
      await checkContext(restaurantName, menuItemName);

      done();
    });
  });

  describe('#updateState() from the cart state', () => {
    beforeEach(done => {
      User.create(phoneNumber, name, email)
        .then(user => user.insertChatState(chatStates.start))
        .then(() => bot.updateState(phoneNumber, `@${restaurantName}`))
        .then(() => bot.updateState(phoneNumber, '1'))
        .then(() => bot.updateState(phoneNumber, '1'))
        .then(() => bot.updateState(phoneNumber, '1'))
        .then(() => done());
    });

    it('should have cleared the item context', async done => {
      await checkContext(restaurantName, null);
      done();
    });

    it('should change to the items state when given <category> command', async done => {
      await bot.updateState(phoneNumber, 'entree');
      await checkState(chatStates.items);
      await checkContext(restaurantName, null);
      done();
    });

    it('should not change states using the /info command', async done => {
      await bot.updateState(phoneNumber, '/info');
      await checkState(chatStates.cart);
      await checkContext(restaurantName, null);
      done();
    });

    it('should switch to the categories state using /menu command', async done => {
      await bot.updateState(phoneNumber, '/menu');
      await checkState(chatStates.categories);
      await checkContext(restaurantName, null);
      done();
    });

    it('should not switch to the categories state using /rcommand', async done => {
      await bot.updateState(phoneNumber, '/r');
      await checkState(chatStates.cart);
      await checkContext(restaurantName, null);
      done();
    });

    it('should not change to the categories state after typing \"@<restaurant> menu\"', async done => {
      await bot.updateState(phoneNumber, `@${restaurantName} menu`);
      await checkState(chatStates.cart);
      await checkContext(restaurantName, null);

      done();
    });

    it('should not change to the items state after typing \"@<restaurant>\"', async done => {
      await bot.updateState(phoneNumber, `@${restaurantName}`);
      await checkState(chatStates.cart);
      await checkContext(restaurantName, null);

      done();
    });

    it('should not change states using the /help command', async done => {
      await bot.updateState(phoneNumber, '/help');
      await checkState(chatStates.cart);
      await checkContext(restaurantName, null);
      done();
    });
  });


  describe('#_isContextual()', () => {
    beforeEach(done => {
      User.create(phoneNumber, name, email)
        .then(user => user.insertChatState(chatStates.start))
        .then(() => bot.updateState(phoneNumber, `@${restaurantName}`))
        .then(() => done());
    });

    it('should determine the correct commands to be context commands', async done => {
      const user = await User.findOneByPhoneNumber(phoneNumber);
      const chatState = await user.findChatState();
      assert.equal(await bot._isContextual(chatState, '/checkout'), true);
      assert.equal(await bot._isContextual(chatState, '/menu'), true);
      assert.equal(await bot._isContextual(chatState, '/info'), true);
      assert.equal(await bot._isContextual(chatState, 'entree'), true);
      done();
    });
  });

  describe('#_isStateless()', () => {
    it('should determine the correct commands to be stateless commands', done => {
      assert.equal(bot._isStateless('/r'), true);
      assert.equal(bot._isStateless('/clear'), true);
      assert.equal(bot._isStateless('/help'), true);
      assert.equal(bot._isStateless('@name'), true);
      assert.equal(bot._isStateless('@name menu'), true);
      assert.equal(bot._isStateless('@name info'), true);
      done();
    });
  });
});
