import ChatBotInterface from './chat-bot-interface.es6';
import * as Restaurant from '../../api/restaurant.es6';
import * as User from '../../api/controllers/user.es6';
import * as Order from '../../api/controllers/order.es6';
import * as Category from '../../api/category.es6';
import * as MenuItem from '../../api/menuItem.es6';
import * as Payment from '../../api/payment.es6';
import * as Mod from '../../api/mod.es6';
import Promise from 'bluebird';
import _ from 'underscore';
import * as Utils from '../utils.es6';
import moment from 'moment';

/* Disabling lint rule since it doesn't make sense */
/* eslint-disable babel/generator-star-spacing,one-var */

/* Chat states for this default bot implementation */
export const chatStates = {
  start: 'Start',
  restaurants: 'Restaurants',
  items: 'Items',
  categories: 'Categories',
  mods: 'Mods',
  cart: 'Cart',
  secondSignup: 'secondSignup'
};

export const response = {
  /* Returned when there is a user error */
  userError: 'Sorry, we don\'t recognize that command. Please try again.',

  invalidRestaurantHandle: 'Sorry, we don\'t recognize that restaurant handle. Please try again.',

  restaurantDisabled: producer => `Sorry, ${producer.name} is currently closed and not accepting orders.` +
    ` To start looking at other restaurants type \"/clear\".`,

  existingOrder: 'Sorry, you cannot make another order while your current one is being processed.',

  finishSecondSignup: `Please finish paying using the link provided above or type \"/clear\" to clear your cart to` +
    ` use additional commands`,

  /* Returned when user tries to execute context command while not in restaurant context */
  invalidContext: 'Sorry that command isn`t available right now. Please try again',

  /* Returned when user tries to execute invalid command when ordering an item */
  finishItem: 'Please finish selecting your item before doing that',

  /* Returned when user checks out with empty cart */
  invalidCheckout: 'You can\'t checkout with an empty cart. Try typing \"/r\" to see restaurants to choose from',

  cartClear: 'Your cart has been cleared. Type \"/menu\" to view the menu or \"/r\" for more restaurants',

  /* I/O formatting for transition to various states */
  restaurant: {
    header: 'Here are our recommended food trucks.',
    footer: 'Type the number of a restaurant or type \"/help\" at any time for help.'
  },

  categories: {
    header: '',
    footer: 'Type a number to see a category',
    dataFormat: async (i, data) => `${i + 1}) ${data[i].name}`
  },

  items: {
    footer: 'Type a number for an item you want or type \"/menu\" to see the full menu',
    dataFormat: async (i, data) => `${i + 1}) ${data[i].name}: $${(data[i].basePrice / 100).toFixed(2)}\n` +
    `--  ${data[i].description.toLowerCase()} `
  },

  mods: {
    dataFormat: async (i, data) => `${i + 1}) ${data[i].name} +$${(data[i].addPrice / 100).toFixed(2)}`
  },

  cart: {
    header: 'Here is your cart',
    footer: 'Type \"/checkout\" to finish and pay, \"/menu\" to browse the menu, ' +
    'or \"/clear\" to clear your entire cart',
    dataFormat: async (i, data) => `${i + 1}) ${data[i].name} - $${(data[i].price / 100).toFixed(2)}`
  },

  help: 'Here is a list of commands:\n' +
  '\"/r\" - lists restaurants\n' +
  '\"@<restaurant name>\" - view restaurant\n' +
  '\"@<restaurant name> menu\" - view menu\n' +
  '\"@<restaurant name> info\" - view hours and restaurant information\n' +
  '\"/help\" - view list of valid commands\n\n' +
  'For example, type \"@macdaddys info\" for information about macdaddys'
};

export default class DefaultChatBot extends ChatBotInterface {
  constructor() {
    super();
    /* Empty Constructor */
  }

  /**
   * Generates the header for the mod states using the current item mod and the current order item being modified
   *
   * @param {ItemMod} itemMod: current item mod that the user is making a choice on
   * @param {OrderItem} orderItem: current order being modified
   * @returns {String} header string for response message
   * @private
   */
  _genModHeader(itemMod, orderItem) {
    if (itemMod.max === 1) {
      return `Type a number to select a ${itemMod.name.toLowerCase()} for` +
        ` (${orderItem.name} - $${(orderItem.price / 100).toFixed(2)})`;
    }
    return `Would you like any ${itemMod.name.toLowerCase()} for` +
      ` (${orderItem.name} - $${(orderItem.price / 100).toFixed(2)})?`;
  }

  _genModFooter(itemMod) {
    if (itemMod.min === 0) {
      return `Select up to ${itemMod.max} options by typing a number or type \"no\" for none of the above. ` +
        `If you want more than one, separate them with commas (e.g. 1,3,5).`;
    }

    if (itemMod.min < itemMod.max) {
      return `Select at least ${itemMod.min} and up to ${itemMod.max} options by typing in comma` +
        ` separated numbers (e.g. 1 or 1,3,2).`;
    }

    return `Select exactly ${itemMod.max} ${itemMod.max > 1 ? 'options' : 'option'} by typing in` +
      ` ${itemMod.max > 1 ? 'comma separated numbers (e.g. 1,2,4).' : 'a number.'}`;
  }

  /**
   * Get string for a day's hours
   * Ex: Resulting String: '1-2PM, 5-7PM'
   *
   * @param {Restaurant} producer: restaurant to get hours for
   * @param {String} day: day in string form - Ex: 'Monday'
   * @returns {String} Formatted Hours
   * @private
   */
  static async _getDayHours(producer, day) {
    const producerHours = _.filter(await producer.findHours(), hour => hour.dayOfTheWeek === day);
    const formattedHours = _.map(producerHours, hour => {
      const openTime = moment(hour.openTime, 'HH:mm:ss').format('h A');
      const closeTime = moment(hour.closeTime, 'HH:mm:ss').format('h A');
      return `${openTime} - ${closeTime}`;
    });
    return formattedHours.join(', ');
  }

  /**
   * Gets producer's info data format string
   *
   * @param {Number} i: index into the producers list
   * @param {Array<Restaurant>} producers: array of producers
   * @returns {String} resulting info string for a producer
   * @private
   */
  static async _genProducerDataFormat(i, producers) {
    const producer = producers[i];
    const {address} = await producer.findLocation();
    // TODO - Figure out solution for
    let dataFormat = `${i + 1}) ${producer.name}: ${producer.enabled ? `OPEN` : `CLOSED`}`;
    dataFormat += `\n${address}`;
    dataFormat += `\nHours: ${ await DefaultChatBot._getDayHours(producer, moment().format('dddd'))}`;
    return dataFormat;
  }

  /**
   * Updates the chat bot state and state metadata for a user given the user command
   *
   * @param {String} phoneNumber: phoneNumber's state to update
   * @param {String} input: the user input
   * @returns {String}: the output of the chat bot
   */
  async updateState(phoneNumber, input) {
    input = input.trim().toLowerCase();
    /* Sanitize user input */

    let user, chatState;
    try {
      user = await User.UserModel.findOneByPhoneNumber(phoneNumber);
      if (!user) {
        // TODO - fix after cfa
        await User.signup(phoneNumber, null, true);
        return await this._handleAtRestaurant(await user.findChatState(), 'chicken');
      }
      chatState = await user.findChatState();
    } catch (err) {
      throw new TraceError(`Could not find user ChatState info for user ${phoneNumber}`, err);
    }

    /* Case where user has to second sign up and uses some other command other than clear */
    if (chatState.state === chatStates.secondSignup && input !== '/clear') {
      return response.finishSecondSignup;
    }

    /* No access to contextual or stateless commands when ordering an item.
     * The user must finish selecting size and mods on item */

    let itemContext, isContextual, isStateless;
    try {
      itemContext = await chatState.findMenuItemContext();
      isContextual = await this._isContextual(chatState, input);
      isStateless = this._isStateless(input);
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} ` +
        `- Failed to determine if command is contextual or stateless for user ${phoneNumber}`, err);
    }

    if ((isContextual || isStateless) && itemContext) {
      return response.finishItem;
    }

    if (isStateless) {
      return await this._statelessTransition(chatState, input);
    }

    if (isContextual) {
      return await this._contextTransitions(chatState, input);
    }

    switch (chatState.state) {
      case chatStates.restaurants:
        return await this._restaurantTransition(chatState, input);
      case chatStates.categories:
        return await this._categoriesTransition(chatState, input);
      case chatStates.items:
        return await this._itemsTransition(chatState, input);
      case chatStates.mods:
        return await this._modsTransition(chatState, input);
      default:
        /* If user isn't in above states and command was not stateless or contextual, then it was
         * an invalid command */
        return response.userError;
    }
  }

   /**
   * Handles transitions from the restaurant state
   *
   * @param {Object} chatState: user chat state
   * @param {String} input: the user input
   * @returns {String}: output of the chat bot
   * @private
   */
  async _restaurantTransition(chatState, input) {
    switch (true) {
      case /^more$/.test(input):
        return await this._handleMore(chatState);
      case /^\d$/.test(input):
        return await this._handleSelectRestaurant(chatState, input);
      default:
        return response.userError;
    }
  }

  async _handleMore(chatState) {
    /* TODO - pagination for finding more. Should not show all restaurants */
    let restaurants;
    try {
      restaurants = await Restaurant.findByMode();
    } catch (err) {
      throw new TraceError('Could not find regular enabled restaurants', err);
    }

    return await this._genOutput(
      chatState,
      response.restaurant.header,
      response.restaurant.footer,
      restaurants,
      DefaultChatBot._genProducerDataFormat);
  }

  async _handleSelectRestaurant(chatState, input) {
    const restaurantId = await this._translateInputKey(chatState, input);
    if (!restaurantId) {
      return response.userError;
    }

    let restaurant, category, menuItems;
    try {
      restaurant = (await Restaurant.findOne(restaurantId)).resolve();
      category = await restaurant.findCategories();
      menuItems = await category[0].findMenuItems(); // TODO - Show the top items instead of the first category
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} ` +
        `- Failed to find restaurant data when selecting a restaurant`, err);
    }

    try {
      await chatState.updateState(chatStates.items);
      await chatState.setRestaurantContext(restaurant);
      return await this._genOutput(
        chatState,
        `Here are ${category[0].name} options from ${restaurant.name}`,
        response.items.footer,
        menuItems,
        response.items.dataFormat);
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to update chat bot metadata`, err);
    }
  }

  /**
   * Handles transitions from the categories state
   *
   * @param {Object} chatState: user chat state
   * @param {String} input: the user input
   * @returns {String}: output of the chat bot
   * @private
   */
  async _categoriesTransition(chatState, input) {
    if (/^\d$/.test(input)) {
      return await this._handleSelectCategory(chatState, input);
    }

    return response.userError;
  }

  async _handleSelectCategory(chatState, input) {
    const categoryId = await this._translateInputKey(chatState, input);
    if (!categoryId) {
      return response.userError;
    }

    let restaurant, category, menuItems;
    try {
      restaurant = await chatState.findRestaurantContext();
      category = await Category.findOne(categoryId);
      menuItems = await category.findMenuItems();
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id}` +
        ` - Failed to get restaurant data when selecting a category`, err);
    }

    try {
      await chatState.updateState(chatStates.items);
      return await this._genOutput(
        chatState,
        `Here are ${category.name} options from ${restaurant.name}`,
        response.items.footer,
        menuItems,
        response.items.dataFormat);
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to update chat bot metadata`, err);
    }
  }

  /**
   * Handles transitions from the items state
   *
   * @param {Object} chatState: user chat state
   * @param {String} input: the user input
   * @returns {String}: output of the chat bot
   * @private
   */
  async _itemsTransition(chatState, input) {
    if (!(/^\d$/.test(input))) {
      return response.userError;
    }

    const menuItemId = await this._translateInputKey(chatState, input);
    if (!menuItemId) {
      return response.userError;
    }

    let menuItem, itemMods;
    try {
      menuItem = await MenuItem.findOne(menuItemId);
      itemMods = await menuItem.findItemMods();
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to get menu data when selecting an item`, err);
    }

    try {
      await chatState.insertOrderItem(menuItem.name, menuItem.basePrice);
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to create a new order item`, err);
    }

    /* Go to the mods state if there are mods and
     * or straight to cart if there are no mods*/
    if (itemMods.length > 0) {
      let sortedItemMods, firstItemMod, mods;
      try {
        sortedItemMods = _.sortBy(itemMods, itemMod => itemMod.id);
        firstItemMod = _.first(sortedItemMods);
        mods = await firstItemMod.findMods();
      } catch (err) {
        throw new TraceError(`ChatState id ${chatState.id} - Failed to get item mod data when selecting an item`, err);
      }

      const footer = this._genModFooter(firstItemMod);

      // Generates the header from the current item mod and current order item being modified
      const orderItem = await chatState.findLastOrderItem();
      const header = this._genModHeader(firstItemMod, orderItem);

      try {
        await chatState.updateState(chatStates.mods);
        await chatState.setMenuItemContext(menuItem);
        await chatState.setItemModContext(firstItemMod);
        return await this._genOutput(
          chatState,
          header,
          footer,
          mods,
          response.mods.dataFormat);
      } catch (err) {
        throw new TraceError(`ChatState id ${chatState.id} - Failed to update chat bot metadata`, err);
      }
    }

    return await this._transitionToCart(chatState);
  }

  /**
   * Handles transitions from the mods state
   *
   * @param {Object} chatState: user chat state
   * @param {String} input: the user input
   * @returns {String}: output of the chat bot
   * @private
   */
  async _modsTransition(chatState, input) {
    if (input === 'no') {
      const itemMod = await chatState.findItemModContext();
      /* User is not allowed to enter no unless min is 0 */
      if (itemMod.min !== 0) {
        return `You are required to select at least ${itemMod.min} options. Please try again.`;
      }

      /* Transition to next mod without editing the order item */
      return await this._modStateTransition(chatState);
    }

    return await this._handleMods(chatState, input);
  }

  async _handleMods(chatState, input) {
    let orderItem, itemMod;
    try {
      orderItem = await chatState.findLastOrderItem();
      itemMod = await chatState.findItemModContext();
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to find order information`, err);
    }

    /* Trim the white space between commas */
    const mods = _.map(input.split(','), mod => mod.trim());
    /* Check if user entered comma separated digits */
    if (!mods.every(mod => /^\d$/.test(mod))) {
      return response.userError;
    }

    /* Test if the user supplied correct number of mods */
    if (mods.length < itemMod.min) {
      return `You are required to select at least ${itemMod.min} options. Please try again.`;
    }

    if (mods.length > itemMod.max) {
      return `You can select at most ${itemMod.max} options. Please try again.`;
    }

    for (let i = 0; i < mods.length; i++) {
      try {
        const tempMod = mods[i];
        mods[i] = await this._translateInputKey(chatState, mods[i]);
        if (Utils.isEmpty(mods[i])) {
          return `Sorry, ${tempMod} is not a valid option. Please try again.`;
        }
      } catch (err) {
        throw new TraceError(`ChatState id ${chatState.id} - Failed to translate user input`, err);
      }
    }

    const nameMods = [];
    await Promise.map(mods, async modId => {
      try {
        const mod = await Mod.findOne(modId); // eslint-disable-line
        // TODO - Find a better way to do this
        const _itemMod = await mod.findItemMod();
        if (_itemMod.name === 'Size') {
          orderItem.name = `${mod.name} ${orderItem.name}`;
        } else {
          nameMods.push(mod.name);
        }
        orderItem.price += mod.addPrice;
      } catch (err) {
        throw new TraceError(`ChatState id ${chatState.id} - Failed to update order item with mods`, err);
      }
    });

    if (orderItem.name.indexOf('with') === -1 && nameMods.length > 0) {
      orderItem.name += 'with';
    }

    orderItem.name += ` ${nameMods.join(', ')}`;

    try {
      await orderItem.save();
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to save order item`, err);
    }

    return await this._modStateTransition(chatState);
  }

  async _modStateTransition(chatState) {
    let itemMod, menuItem, itemMods, sortedItemMods;

    try {
      itemMod = await chatState.findItemModContext();
      menuItem = await chatState.findMenuItemContext();
      itemMods = await menuItem.findItemMods();
      sortedItemMods = _.sortBy(itemMods, elem => elem.id);
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Could not find item mod information`, err);
    }

    const lastIndex = _.findIndex(sortedItemMods, sortedItemMod => sortedItemMod.id === itemMod.id);

    if (lastIndex + 1 >= sortedItemMods.length) {
      return await this._transitionToCart(chatState);
    }

    const nextItemMod = sortedItemMods[lastIndex + 1];
    await chatState.setItemModContext(nextItemMod);
    const mods = await nextItemMod.findMods();

    const footer = this._genModFooter(nextItemMod);

    // Generates the header from the current item mod and current order item being modified
    const orderItem = await chatState.findLastOrderItem();
    const header = this._genModHeader(nextItemMod, orderItem);

    /* Note that we don't update the state here since we have more mods to process */
    return await this._genOutput(
      chatState,
      header,
      footer,
      mods,
      response.mods.dataFormat);
  }

  /**
   * Handles commands that are executed within a context
   *
   * @param {Object} chatState: chat state object for this transition
   * @param {String} input: user input
   * @returns {String}: returns the chat bot output
   * @private
   */
  async _contextTransitions(chatState, input) {
    let restaurant;
    try {
      restaurant = await chatState.findRestaurantContext();
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Error finding restaurant context`);
    }
    /* Tried to use a contextual command when user is not in a context */
    if (Utils.isEmpty(restaurant)) {
      return response.invalidContext;
    }

    switch (true) {
      case /^\/checkout$/.test(input):
        return await this._handleCheckout(chatState);
      case /^\/menu$/.test(input):
        return await this._handleContextMenu(chatState, restaurant);
      case /^\/info$/.test(input):
        return await this._handleContextInfo(chatState, restaurant);
      case /^[a-zA-Z]+$/.test(input):
        return await this._handleCategory(chatState, input, restaurant);
      default:
        throw new TraceError(`ChatState id ${chatState.id}  ` +
          `- Called context transition when command was not contextual`);
    }
  }

  /**
   * Checks if the input is a contextual command
   *
   * @param {Object} chatState: user chat state
   * @param {String} input: user input
   * @returns {boolean}: true if contextual and false otherwise
   * @private
   */
  async _isContextual(chatState, input) {
    let isCategory = false;
    try {
      const restContext = await chatState.findRestaurantContext();
      if (restContext) {
        const categories = await restContext.findCategories();
        isCategory = _.find(categories, cat => cat.name.toLowerCase() === input) !== undefined;
      }
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to determine if user selected a category`, err);
    }

    return /^\/checkout$/.test(input)
      || /^\/menu$/.test(input)
      || /^\/info$/.test(input)
      || isCategory;
  }

  async _handleCategory(chatState, input, restContext) {
    let categories, category, menuItems;
    try {
      categories = await restContext.findCategories();
      category = categories.filter(cat => cat.name.toLowerCase() === input)[0];
      menuItems = await category.findMenuItems();
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to get restaurant data`, err);
    }
    try {
      await chatState.updateState(chatStates.items);
      return await this._genOutput(
        chatState,
        `Here are ${category.name} options from ${restContext.name}`,
        response.items.footer,
        menuItems,
        response.items.dataFormat);
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to update chatbot [_handleCategory]`, err);
    }
  }

  async _handleCheckout(chatState) {
    let restaurant, user;
    /* Check if restaurant is open */
    try {
      restaurant = await chatState.findRestaurantContext();
      if (!restaurant.enabled) {
        return response.restaurantDisabled(restaurant);
      }
      user = await chatState.findUser();
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to find user or restaurant for an order`, err);
    }

    let orderItems;
    try {
      orderItems = await chatState.findOrderItems();
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to find order items`, err);
    }

    /* Check if user has any order items */
    if (orderItems.length === 0) {
      return response.invalidCheckout;
    }

    /* Cannot make process two orders at once */
    const orderContext = await chatState.findOrderContext();
    if (orderContext) {
      return response.existingOrder;
    }

    /* Do not create order object unless user has payment. Order will be created in
    * dispatcher.es6 for first time users */
    let defaultPayment;
    try {
      defaultPayment = await Payment.getCustomerDefaultPayment(user.id);
    } catch (defaultPaymentError) {
      console.tag('chatbot').log('No default payment found. Sending user to signup2.');
      const secret = await User.requestProfileEdit(user.id);
      const url = await User.resolveProfileEditAddress(secret.secret);

      chatState.updateState(chatStates.secondSignup);
      return `To complete your order and pay, please go to ${url}`;
    }

    let output = '';
    let total = 0;
    for (let i = 0; i < orderItems.length; i++) {
      output += `${orderItems[i].name}, `;
      total += orderItems[i].price;
    }

    // transform for order to support orders
    const items = orderItems.map(({name, price}) => ({name, price, quantity: 1}));
    let order;

    try {
      order = await Order.createOrder(user.id, restaurant.id, items);
      await chatState.setOrderContext(order.resolve());
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to create order and set the context`, err);
    }

    try {
      const {id: transactionId} = await Payment.paymentWithToken(user.id, restaurant.id, defaultPayment.token, total);
      await Order.setOrderStatus(order.id, Order.Status.RECEIVED_PAYMENT, {transactionId});
    } catch (paymentWithTokenError) {
      console.tag('chatbot').error('Payment failed although customer default payment exists', paymentWithTokenError);
      throw new TraceError('Payment failed although customer default payment exists', paymentWithTokenError);
    }

    await chatState.clearOrderItems();
    await chatState.updateState(chatStates.start);

    return `Your order using ${defaultPayment.cardType} - ${defaultPayment.last4} has been sent to the restaurant. ` +
      `We'll text you once it's confirmed by the restaurant`;
  }

  async _handleContextMenu(chatState, restContext) {
    return await this._handleAtRestaurantMenu(chatState, restContext.handle, true);
  }

  async _handleContextInfo(chatState, restaurant) {
    return await this._getRestaurantInfo(chatState, restaurant);
  }

  /**
   * Returns if the input is a stateless command
   *
   * @param {String} input: user input
   * @returns {boolean}: true if it is stateless and false otherwise
   * @private
   */
  _isStateless(input) {
    return /^\/r$/.test(input)
      || /^@[^ ]+$/.test(input)
      || /^@[^ ]+\ menu$/.test(input)
      || /^@.+\ info$/.test(input)
      || /^\/help$/.test(input)
      || /^\/clear$/.test(input);
  }

  /**
   * Handles transitions when the command is stateless
   *
   * @param {Object} chatState: current chat state object for the user
   * @param {String} input: the user input
   * @returns {String}: output of the chat bot
   * @private
   */
  async _statelessTransition(chatState, input) {
    switch (true) {
      case /^\/r$/.test(input):
        return await this._handleRestaurant(chatState);
      case /^\/clear$/.test(input):
        return await this._handleClear(chatState);
      case /^@[^ ]+$/.test(input):
        return await this._handleAtRestaurant(chatState, input.substr(1));
      case /^@[^ ]+\ menu$/.test(input):
        return await this._handleAtRestaurantMenu(chatState, input.split(' ')[0].substr(1), false);
      case /^@.+\ info$/.test(input):
        return await this._handleAtRestaurantInfo(chatState, input.split(' ')[0].substr(1));
      case /^\/help$/.test(input):
        return await this._handleHelp();
      default:
        throw new TraceError(`ChatState id ${chatState.id} ` +
          `- Called stateless transition when command was not stateless`);
    }
  }

  /**
   * Handles chat bot of "/r" command
   *
   * @param {Object} chatState: input chat state object
   * @returns {String}: output of the transition
   * @private
   */
  async _handleRestaurant(chatState) {
    const invalidTransition = await this._checkTransition(chatState);
    if (invalidTransition) {
      return invalidTransition;
    }

    let restaurants;
    try {
      restaurants = await Restaurant.findByMode();
    } catch (err) {
      throw new TraceError('Could not find regular enabled restaurants', err);
    }

    try {
      await chatState.updateState(chatStates.restaurants);
      // TODO - Replace this with curation of recommended restaurants
      return await this._genOutput(
        chatState,
        response.restaurant.header,
        response.restaurant.footer,
        restaurants,
        DefaultChatBot._genProducerDataFormat);
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to update chatbot [_handleRestaurant]`, err);
    }
  }

  /**
   * Handles chat bot of "@<restaurant>" command
   *
   * @param {Object} chatState: input chat state object
   * @param {String} restaurantName: user input restaurant name
   * @returns {String}: output of the transition
   * @private
   */
  async _handleAtRestaurant(chatState, restaurantName) {
    const invalidTransition = await this._checkTransition(chatState);
    if (invalidTransition) {
      return invalidTransition;
    }

    let restaurant, categories, menuItems;
    try {
      restaurant = (await Restaurant.findByHandle(restaurantName)).resolve();
    } catch (err) {
      /* User typed in a restaurant handle that doesn't exist */
      return response.invalidRestaurantHandle;
    }

    try {
      categories = await restaurant.findCategories();
      menuItems = await categories[0].findMenuItems(); // TODO - curate items
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to get restaurant data`, err);
    }

    try {
      await chatState.updateState(chatStates.items);
      await chatState.setRestaurantContext(restaurant);
      return await this._genOutput(
        chatState,
        `Here are ${categories[0].name} options from ${restaurant.name}`,
        response.items.footer,
        menuItems,
        response.items.dataFormat);
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to update chatbot [_handleAtRestaurant]`, err);
    }
  }

  /**
   * Handles chat bot of "@<restaurant> menu" command
   *
   * @param {Object} chatState: input chat state object
   * @param {String} restaurantName: user input restaurant name
   * @param {Boolean} isContextual: determines if the call to this function is by "menu" contextual command
   * @returns {String}: output of the transition
   * @private
   */
  async _handleAtRestaurantMenu(chatState, restaurantName, isContextual) {
    // TODO - @jesse Refactor this function to a separate function
    const invalidTransition = await this._checkTransition(chatState);
    if (!isContextual && invalidTransition) {
      return invalidTransition;
    }

    let restaurant, categories;
    try {
      restaurant = (await Restaurant.findByHandle(restaurantName)).resolve();
    } catch (err) {
      /* User typed in a restaurant handle that doesn't exist */
      return response.invalidRestaurantHandle;
    }

    try {
      categories = await restaurant.findCategories();
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to get restaurant menu data`, err);
    }
    try {
      await chatState.updateState(chatStates.categories);
      await chatState.setRestaurantContext(restaurant);
      return await this._genOutput(
        chatState,
        response.categories.header,
        response.categories.footer,
        categories,
        response.categories.dataFormat);
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to update chatbot [_handleAtRestaurantMenu]`, err);
    }
  }

  /**
   * Handles chat bot of "@<restaurant> info" command
   *
   * @param {Object} chatState: chatState object
   * @param {String} restaurantName: user input restaurant name
   * @returns {String}: output of the transition
   * @private
   */
  async _handleAtRestaurantInfo(chatState, restaurantName) {
    let restaurant;
    try {
      restaurant = (await Restaurant.findByHandle(restaurantName)).resolve();
    } catch (err) {
      return response.invalidRestaurantHandle;
    }

    return await this._getRestaurantInfo(chatState, restaurant);
  }

  /**
   * Handles chat bot of "help" command
   *
   * @returns {String}: help the user
   * @private
   */
  async _handleHelp() {
    return response.help;
  }

  async _getRestaurantInfo(chatState, restaurant) {
    let location, hours;
    try {
      location = await restaurant.findLocation();
      hours = await restaurant.findHours();
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to get restaurant info`, err);
    }

    let output = `Information for ${restaurant.name}\n\n`;
    output += `Location:\n${location.address}\n${location.city}, ${location.state} ${location.zipcode}\n\n`;
    output += 'Hours:\n';
    for (let i = 0; i < hours.length; i++) { // eslint-disable-line
      const day = moment(hours[i].dayOfTheWeek, 'dddd').format('ddd');
      const openTime = moment(hours[i].openTime, 'HH:mm:ss').format('h:mma');
      const closeTime = moment(hours[i].closeTime, 'HH:mm:ss').format('h:mma');
      output += `${day} - ${openTime} to ${closeTime}\n`;
    }

    return output;
  }

  async _handleClear(chatState) {
    try {
      await chatState.clearOrderItems();
      await chatState.updateState(chatStates.start);
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to update chat state metadata`, err);
    }
    return response.cartClear;
  }

  async _genOutput(chatState, header, footer, data, dataFunc) {
    try {
      await chatState.clearCommandMaps();
      let output = `${header}\n\n`;

      for (let i = 0; i < data.length; i++) {
        await chatState.insertCommandMap(i + 1, data[i].id); // eslint-disable-line
        output += `${ await dataFunc(i, data)}\n`;
      }
      return `${output}\n${footer}`;
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to generate state transition output`, err);
    }
  }

  async _transitionToCart(chatState) {
    let orderItems;
    let total = 0;
    try {
      orderItems = await chatState.findOrderItems();
    } catch (err) {
      throw new TraceError('Failed to find order items', err);
    }

    _.each(orderItems, orderItem => total += orderItem.price);

    try {
      await chatState.updateState(chatStates.cart);
      await chatState.clearMenuItemContext();
      return await this._genOutput(
        chatState,
        response.cart.header,
        `Your current total is $${(total / 100).toFixed(2)}. ${response.cart.footer}`,
        orderItems,
        response.cart.dataFormat);
    } catch (err) {
      throw new TraceError('Failed to update chat bot metadata', err);
    }
  }

  async _translateInputKey(chatState, input) {
    try {
      const key = parseInt(input, 10);
      const commandMaps = await chatState.findCommandMaps();
      for (let i = 0; i < commandMaps.length; i++) {
        if (commandMaps[i].key === key) {
          return commandMaps[i].value;
        }
      }
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to translate user input key`);
    }

    return null;
  }

  async _checkTransition(chatState) {
    let orderItems;
    try {
      orderItems = await chatState.findOrderItems();
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to find order items`, err);
    }

    if (orderItems.length > 0) {
      let restaurant;
      try {
        restaurant = await chatState.findRestaurantContext();
      } catch (err) {
        throw new TraceError(`ChatState id ${chatState.id} - Failed to find restaurant context`, err);
      }

      return `Please finish ordering with ${restaurant.name} or clear your cart by typing \"/clear\" before` +
        ` browsing other restaurants`;
    }

    return null;
  }
}
