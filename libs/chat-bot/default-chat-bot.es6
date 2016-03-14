import ChatBotInterface from './chat-bot-interface.es6';
import * as Restaurant from '../../api/restaurant.es6';
import * as User from '../../api/user.es6';
import * as Category from '../../api/category.es6';
import * as MenuItem from '../../api/menuItem.es6';
import * as Size from '../../api/size.es6';
import * as ItemMod from '../../api/itemMod.es6';
import Promise from 'bluebird';
import _ from 'underscore';

/* Disabling lint rule since it doesn't make sense */
/* eslint-disable babel/generator-star-spacing */

/* Chat states for this default bot implementation */
export const chatStates = {
  start: 'Start',
  restaurants: 'Restaurants',
  items: 'Items',
  categories: 'Categories',
  size: 'Size',
  mods: 'Mods',
  cart: 'Cart',
  cardInfo: 'CardInfo'
};

const response = {
  /* Returned when there is a user error */
  userError: 'Sorry, we don\'t recognize that command. Please try again.',

  /* Returned when user tries to execute invalid command when ordering an item */
  finishItem: 'Please finish selecting your item before doing that',

  /* Returned when user checks out with empty cart */
  invalidCheckout: 'You can\'t checkout with an empty cart. Try typing \"restaurants\" to explore a menu',

  cartClear: 'Your cart has been cleared. Type \"menu\" to view the menu or \"restaurants\" for more restaurants',

  /* I/O formatting for transition to various states */
  restaurant: {
    header: '',
    footer: 'Type \"more\" for more restaurants or type a number to select a restaurant',
    dataFormat: (i, data) => `${i}: ${data[i].name}`
  },

  categories: {
    header: '',
    footer: 'Type a number to select a category',
    dataFormat: (i, data) => `${i}) ${data[i].name}`
  },

  items: {
    header: `Here are items from `,
    footer: 'Type a number to select an item, or type \"menu\" to see the entire menu',
    dataFormat: (i, data) => `${i}) ${data[i].name} - $${data[i].basePrice / 100}`
  },

  size: {
    header: 'Here are the available sizes',
    footer: 'Type in a number to select a size',
    dataFormat: (i, data) => `${i}: ${data[i].name} +$${data[i].addPrice / 100}`
  },

  mods: {
    header: 'Here are the available item modifications',
    footer: 'Type your desired modifications separated by a comma (e.g. 0 or 0,2,1) or \"none\"',
    dataFormat: (i, data) => `${i}: ${data[i].name} +$${data[i].addPrice / 100}`
  },

  cart: {
    header: 'Here is your item cart',
    footer: 'Type \"checkout\" to pay, \"menu\" to browse the menu, ' +
    'or \"clear\" to clear your entire cart',
    dataFormat: (i, data) => `${i}: ${data[i].name} - $${data[i].price / 100}`
  },

  help: 'Here are a list of valid commands:\n' +
    '\"restaurants\" - list restaurants\n' +
    '\"@<name>\" - browse restaurant\n' +
    '\"@<name> menu\" - view menu\n' +
    '\"@<name> info\" - view info\n' +
    '\"help\" - this command\n\n' +
    'For example, type \"@homeslice info\" for information about homeslice'
};

export default class DefaultChatBot extends ChatBotInterface {
  constructor() {
    super();
    /* Empty Constructor */
  }

  /**
   * Updates the chat bot state and state metadata for a user given the user command
   *
   * @param {String} phoneNumber: phoneNumber's state to update
   * @param {String} input: the user input
   * @returns {String}: the output of the state transition
   */
  async updateState(phoneNumber, input) {
    console.tag('chatbot').log({phoneNumber, input});
    input = input.trim().toLowerCase(); /* Sanitize user input */

    const user = await User.findOneByPhoneNumber(phoneNumber);
    const chatState = await user.findChatState();

    console.tag('chatbot').log({user: user.toJSON(), chatState: chatState.toJSON()});
    console.tag('chatbot').log({state: chatState.state});

    /* No access to contextual or stateless commands when ordering an item.
     * The user must finish selecting size and mods on item */
    const itemContext = await chatState.findMenuItemContext();
    const isContextual = await this._isContextual(chatState, input);
    const isStateless = this._isStateless(input);
    if ((isContextual || isStateless) && itemContext) {
      return response.finishItem;
    }

    if (isStateless) {
      return await this._statelessTransition(chatState, input);
    }

    if (isContextual) {
      return await this._contextTransitions(chatState, input);
    }

    /**
     * Intercepting for direct commands
     * NOTE this is some shit code! only for demo
     */
    if (input.indexOf('@') === 0) {
      const restaurant = /@(.)*?\s/g.exec(input)[0].trim();
      const items = input.replace(restaurant, '').trim().split(',').map(a => {
        const [, quantity, name] = /([0-9])+?(.*)?/g.exec(a);
        return {quantity: Number(quantity), name};
      });

      return {response: 'We are ordering it for you', restaurant: restaurant.replace('@', ''), order: {items}};
    }

    switch (chatState.state) {
      case chatStates.restaurants:
        return await this._restaurantTransition(chatState, input);
      case chatStates.categories:
        return await this._categoriesTransition(chatState, input);
      case chatStates.items:
        return await this._itemsTransition(chatState, input);
      case chatStates.size:
        return await this._sizeTransition(chatState, input);
      case chatStates.mods:
        return await this._modsTransition(chatState, input);
      default:
        throw (Error('User is in invalid state'));
    }
  }

  /**
   * Handles transitions from the restaurant state
   *
   * @param {Object} chatState: user chat state
   * @param {String} input: the user input
   * @returns {String}: output of the state transition
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
    const restaurants = await Restaurant.findAll();
    return await this._genOutput(
      chatState,
      response.restaurant.header,
      response.restaurant.footer,
      restaurants,
      response.restaurant.dataFormat);
  }

  async _handleSelectRestaurant(chatState, input) {
    const restaurantId = await this._translateInputKey(chatState, input);
    if (!restaurantId) {
      return response.userError;
    }

    const restaurant = await Restaurant.findOne(restaurantId);
    const category = await restaurant.findCategories();
    const menuItems = await category[0].findMenuItems();
    await chatState.updateState(chatStates.items);
    await chatState.setRestaurantContext(restaurant);
    return await this._genOutput(
      chatState,
      `${response.items.header} ${restaurant.name}`,
      response.items.footer,
      menuItems,
      response.items.dataFormat);
  }

  /**
   * Handles transitions from the categories state
   *
   * @param {Object} chatState: user chat state
   * @param {String} input: the user input
   * @returns {String}: output of the state transition
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

    const restaurant = await chatState.findRestaurantContext();
    const category = await Category.findOne(categoryId);
    const menuItems = await category.findMenuItems();
    await chatState.updateState(chatStates.items);
    return await this._genOutput(
      chatState,
      `${response.items.header} ${restaurant.name}`,
      response.items.footer,
      menuItems,
      response.items.dataFormat);
  }

  /**
   * Handles transitions from the items state
   *
   * @param {Object} chatState: user chat state
   * @param {String} input: the user input
   * @returns {String}: output of the state transition
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

    const menuItem = await MenuItem.findOne(menuItemId);
    const sizes = await menuItem.findSizes();
    const itemMods = await menuItem.findItemMods();

    await chatState.insertOrderItem(menuItem.name, menuItem.basePrice);

    /* Go to sizes state if the item requires size, or the mods state if there are mods and
    * no sizes, or straight to cart if there are no mods and no sizes */
    if (sizes.length > 0) {
      await chatState.updateState(chatStates.size);
      await chatState.setMenuItemContext(menuItem);

      return await this._genOutput(
        chatState,
        response.size.header,
        response.size.footer,
        sizes,
        response.size.dataFormat);
    } else if (itemMods.length > 0) {
      await chatState.updateState(chatStates.mods);
      await chatState.setMenuItemContext(menuItem);

      return await this._genOutput(
        chatState,
        response.mods.header,
        response.mods.footer,
        itemMods,
        response.mods.dataFormat);
    }

    return await this._transitionToCart(chatState);
  }

  /**
   * Handles transitions from the sizes state
   *
   * @param {Object} chatState: user chat state
   * @param {String} input: the user input
   * @returns {String}: output of the state transition
   * @private
   */
  async _sizeTransition(chatState, input) {
    if (/^\d$/.test(input) === false) {
      return response.userError;
    }

    const value = await this._translateInputKey(chatState, input);
    if (!value) {
      return response.userError;
    }

    const orderItem = await chatState.findLastOrderItem();
    const size = await Size.findOne(value);

    orderItem.name = `${size.name} ${orderItem.name}`;
    orderItem.price += size.addPrice;
    await orderItem.save();

    const menuItem = await chatState.findMenuItemContext();
    const itemMods = await menuItem.findItemMods();
    if (itemMods.length > 0) {
      await chatState.updateState(chatStates.mods);
      await chatState.setMenuItemContext(menuItem);
      return await this._genOutput(
        chatState,
        response.mods.header,
        response.mods.footer,
        itemMods,
        response.mods.dataFormat);
    }

    return await this._transitionToCart(chatState);
  }

  /**
   * Handles transitions from the mods state
   *
   * @param {Object} chatState: user chat state
   * @param {String} input: the user input
   * @returns {String}: output of the state transition
   * @private
   */
  async _modsTransition(chatState, input) {
    if (input === 'none') {
      return await this._transitionToCart(chatState);
    }

    return this._handleMods(chatState, input);
  }

  async _handleMods(chatState, input) {
    const orderItem = await chatState.findLastOrderItem();
    const mods = input.split(',');
    if (mods.length > 0) {
      orderItem.name += ' with';
    }

    /* Check if user entered comma separated digits */
    if (!mods.every(mod => /^\d$/.test(mod))) {
      return response.userError;
    }

    for (let i = 0; i < mods.length; i++) {
      try {
        mods[i] = await this._translateInputKey(chatState, mods[i]);
      } catch (err) {
        throw new TraceError(`ChatState id ${chatState.id} - Failed to translate user input`, err);
      }
    }

    if (!mods.every(modId => modId !== null)) {
      return response.userError;
    }

    await Promise.map(mods, async modId => {
      try {
        const itemMod = await ItemMod.findOne(modId); // eslint-disable-line
        orderItem.name += ` ${itemMod.name},`;
        orderItem.price += itemMod.addPrice;
      } catch (err) {
        throw new TraceError(`ChatState id ${chatState.id} - Failed to update order item with mods`, err);
      }
    });

    /* Remove the trailing comma */
    orderItem.name = orderItem.name.slice(0, -1);
    try {
      await orderItem.save();
    } catch (err) {
      throw new TraceError(`ChatState id ${chatState.id} - Failed to save order item`, err);
    }
    return await this._transitionToCart(chatState);
  }

  /**
   * Handles commands that are executed within a context
   *
   * @param {Object} chatState: chat state object for this transition
   * @param {String} input: user input
   * @returns {String}: returns the state transition output
   * @private
   */
  async _contextTransitions(chatState, input) {
    switch (true) {
      case /^checkout$/.test(input):
        return await this._handleCheckout(chatState);
      case /^menu$/.test(input):
        return await this._handleContextMenu(chatState);
      case /^\/info$/.test(input):
        return await this._handleContextInfo(chatState);
      case /^[a-zA-Z]+$/.test(input):
        return await this._handleCategory(chatState, input);
      default:
        throw (Error('Called context transition when command was not contextual'));
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
    const restContext = await chatState.findRestaurantContext();
    if (restContext) {
      const categories = await restContext.findCategories();
      isCategory = _.find(categories, cat => cat.name.toLowerCase() === input) !== undefined;
    }

    return /^checkout$/.test(input)
      || /^menu$/.test(input)
      || /^\/info$/.test(input)
      || isCategory;
  }

  async _handleCategory(chatState, input) {
    const restContext = await chatState.findRestaurantContext();
    const categories = await restContext.findCategories();
    const category = categories.filter(cat => cat.name.toLowerCase() === input)[0]; // TODO - Reccomendations
    const menuItems = await category.findMenuItems();
    await chatState.updateState(chatStates.items);

    return await this._genOutput(
      chatState,
      `${response.items.header} ${restContext.name}`,
      response.items.footer,
      menuItems,
      response.items.dataFormat);
  }

  async _handleCheckout(chatState) {
    const orderItems = await chatState.findOrderItems();
    if (orderItems.length === 0) {
      return response.invalidCheckout;
    }

    let output = '';
    let total = 0;
    for (let i = 0; i < orderItems.length; i++) {
      output += `${orderItems[i].name}, `;
      total += orderItems[i].price;
    }

    await chatState.clearOrderItems();
    await chatState.updateState(chatStates.start);
    /* TODO -- transfer order items over to permanent order object
    * what should I return for the payment processing? */

    /* Slice to remove trailing comma and whitespcae */
    return `Your order of ${output.slice(0, -2)} for a total of $${total / 100} has been placed.` +
      'We will text you when it\'s ready.';
  }

  async _handleContextMenu(chatState) {
    const restaurant = await chatState.findRestaurantContext();
    return await this._handleAtRestaurantMenu(chatState, restaurant.name);
  }

  async _handleContextInfo(chatState) {
    const restaurant = await chatState.findRestaurantContext();
    return await this._handleAtRestaurantInfo(restaurant.name);
  }

  /**
   * Returns if the input is a stateless command
   *
   * @param {String} input: user input
   * @returns {boolean}: true if it is stateless and false otherwise
   * @private
   */
  _isStateless(input) {
    return /^restaurants$/.test(input)
      || /^@[^ ]+$/.test(input)
      || /^@[^ ]+\ menu$/.test(input)
      || /^@.+\ info$/.test(input)
      || /^\/help$/.test(input)
      || /^clear$/.test(input);
  }

  /**
   * Handles transitions when the command is stateless
   *
   * @param {Object} chatState: current chat state object for the user
   * @param {String} input: the user input
   * @returns {String}: output of the state transition
   * @private
   */
  async _statelessTransition(chatState, input) {
    switch (true) {
      case /^restaurants$/.test(input):
        return await this._handleRestaurant(chatState);
      case /^clear$/.test(input):
        return await this._handleClear(chatState);
      case /^@[^ ]+$/.test(input):
        return await this._handleAtRestaurant(chatState, input.substr(1));
      case /^@[^ ]+\ menu$/.test(input):
        return await this._handleAtRestaurantMenu(chatState, input.split(' ')[0].substr(1));
      case /^@.+\ info$/.test(input):
        return await this._handleAtRestaurantInfo(input.split(' ')[0].substr(1));
      case /^\/help$/.test(input):
        return await this._handleHelp();
      default:
        throw (Error('Called stateless transition when command was not stateless'));
    }
  }

  /**
   * Handles state transition of "restaurant" command
   *
   * @param {Object} chatState: input chat state object
   * @returns {String}: output of the transition
   * @private
   */
  async _handleRestaurant(chatState) {
    await chatState.updateState(chatStates.restaurants);
    const restaurants = await Restaurant.findAll(); // TODO - Replace this with curation of recommended restaurants
    return await this._genOutput(
      chatState,
      response.restaurant.header,
      response.restaurant.footer,
      restaurants,
      response.restaurant.dataFormat);
  }

  /**
   * Handles state transition of "@<restaurant>" command
   *
   * @param {Object} chatState: input chat state object
   * @param {String} input: user input restaurant name
   * @returns {String}: output of the transition
   * @private
   */
  async _handleAtRestaurant(chatState, input) {
    const restaurant = await Restaurant.findByName(input);
    if (!restaurant) {
      /* User typed in a restaurant name that doesn't exist */
      return response.userError;
    }

    const categories = await restaurant.findCategories();
    const menuItems = await categories[0].findMenuItems(); // TODO - curate items
    await chatState.updateState(chatStates.items);
    await chatState.setRestaurantContext(restaurant);
    return await this._genOutput(
      chatState,
      response.items.header,
      response.items.footer,
      menuItems,
      response.items.dataFormat);
  }

  /**
   * Handles state transition of "@<restaurant> menu" command
   *
   * @param {Object} chatState: input chat state object
   * @param {String} input: user input restaurant name
   * @returns {String}: output of the transition
   * @private
   */
  async _handleAtRestaurantMenu(chatState, input) {
    const restaurant = await Restaurant.findByName(input);
    if (!restaurant) {
      /* User typed in a restaurant name that doesn't exist */
      return response.userError;
    }

    const categories = await restaurant.findCategories();
    await chatState.updateState(chatStates.categories);
    await chatState.setRestaurantContext(restaurant);
    return await this._genOutput(
      chatState,
      response.categories.header,
      response.categories.footer,
      categories,
      response.categories.dataFormat);
  }

  /**
   * Handles state transition of "@<restaurant> info" command
   *
   * @param {String} input: user input restaurant name
   * @returns {String}: output of the transition
   * @private
   */
  async _handleAtRestaurantInfo(input) {
    const restaurant = await Restaurant.findByName(input);
    if (!restaurant) {
      /* User typed in a restaurant name that doesn't exist */
      return response.userError;
    }

    let output = `Info for ${restaurant.name}\n\n`;

    const location = await restaurant.findLocation();
    output += `Location: ${location.address} ${location.city}, ${location.state} ${location.zipcode}\n`;

    output += 'Hours:\n';
    const hours = await restaurant.findHours();
    for (let i = 0; i < hours.length; i++) { // eslint-disable-line
      output += `${hours[i].dayOfTheWeek} - ${hours[i].openTime} to ${hours[i].closeTime}\n`;
    }

    return output;
  }

  /**
   * Handles state transition of "help" command
   *
   * @returns {String}: help the user
   * @private
   */
  async _handleHelp() {
    return response.help;
  }

  async _handleClear(chatState) {
    await chatState.clearOrderItems();
    return response.cartClear;
  }

  async _genOutput(chatState, header, footer, data, dataFunc) {
    await chatState.clearCommandMaps();
    let output = `${header}\n\n`;

    for (let i = 0; i < data.length; i++) {
      await chatState.insertCommandMap(i, data[i].id); // eslint-disable-line
      output += `${dataFunc(i, data)}\n`;
    }

    return `${output}\n${footer}`;
  }

  async _transitionToCart(chatState) {
    const orderItems = await chatState.findOrderItems();
    await chatState.updateState(chatStates.cart);
    await chatState.clearMenuItemContext();
    return await this._genOutput(
      chatState,
      response.cart.header,
      response.cart.footer,
      orderItems,
      response.cart.dataFormat);
  }

  async _translateInputKey(chatState, input) {
    const key = parseInt(input, 10);
    const commandMaps = await chatState.findCommandMaps();
    for (let i = 0; i < commandMaps.length; i++) {
      if (commandMaps[i].key === key) {
        return commandMaps[i].value;
      }
    }

    return null;
  }
}
