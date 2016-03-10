import ChatBotInterface from './chat-bot-interface.es6';
import * as Restaurant from '../../api/restaurant.es6';
import * as User from '../../api/user.es6';
import * as Category from '../../api/category.es6';
import * as MenuItem from '../../api/menuItem.es6';
import * as Size from '../../api/size.es6';
import * as ItemMod from '../../api/itemMod.es6';

const userError = 'Sorry, we don\'t recognize that command. Try something else.';

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

    input = input.trim().toLowerCase();
    /* Sanitize user input */

    const user = await User.findOneByPhoneNumber(phoneNumber);
    const chatState = await user.findChatState();

    console.tag('chatbot').log({user: user.toJSON(), chatState: chatState.toJSON()});

    /* No access to contextual or stateless commands when ordering an item.
     * The user must finish selecting size and mods on item */
    const itemCtx = await chatState.findMenuItemCtx();
    if ((this._isContextual(input) || this._isStateless(input)) && itemCtx) {
      return 'Please finish ordering your item before doing that';
    }

    if (this._isStateless(input)) {
      return await this._statelessTransition(chatState, input);
    }

    if (this._isContextual(input)) {
      return await this._contextTransitions(chatState, input);
    }

    console.tag('chatbot').log({state: chatState.state});

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
      /* The start state does not have any stateful commands */
      case chatStates.start:
        return this._handleHelp();
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
        return await this._handleRestaurantSelect(chatState, input);
      default:
        return userError;
    }
  }

  async _handleMore(chatState) {
    const restaurants = await Restaurant.findAll();
    return await this._genOutput(
      chatState,
      '',
      '\nType a number to select a restaurant',
      restaurants,
      (i, data) => `${i}: ${data[i].name}\n`);
  }

  async _handleRestaurantSelect(chatState, input) {
    const value = await this._translateInputKey(chatState, input);
    if (!value) {
      return userError;
    }

    const restaurant = await Restaurant.findOne(value);
    const category = await restaurant.findCategories();
    const menuItems = await category[0].findMenuItems();
    await chatState.updateState(chatStates.items);
    await chatState.setRestaurantCtx(restaurant);
    return await this._genOutput(
      chatState,
      'Here are the recommended item \n\n',
      '\nType a number to select an item, or type \"menu\" to see the entire menu',
      menuItems,
      (i, data) => `${i}) ${data[i].name} - $${data[i].basePrice / 100}\n`);
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
    switch (true) {
      case /^\d$/.test(input):
        return await this._handleCategorySelect(chatState, input);
      default:
        return userError;
    }
  }

  async _handleCategorySelect(chatState, input) {
    const value = await this._translateInputKey(chatState, input);
    if (!value) {
      return userError;
    }

    const category = await Category.findOne(value);
    const menuItems = await category.findMenuItems();
    await chatState.updateState(chatStates.items);
    return await this._genOutput(
      chatState,
      '',
      '\nType a number to select an item, or type \"menu\" to see the entire menu',
      menuItems,
      (i, data) => `${i}) ${data[i].name} - $${data[i].basePrice / 100}\n`);
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
    if (/^\d$/.test(input) === false) {
      return userError;
    }

    const value = await this._translateInputKey(chatState, input);
    if (!value) {
      return userError;
    }

    const menuItem = await MenuItem.findOne(value);
    const sizes = await menuItem.findSizes();
    const itemMods = await menuItem.findItemMods();

    await chatState.insertOrderItem(menuItem.name, menuItem.basePrice);

    if (sizes.length > 0) {
      await chatState.updateState(chatStates.size);
      await chatState.setMenuItemCtx(menuItem);

      return await this._genOutput(
        chatState,
        'Here are the available sizes\n\n',
        '\nType in a number to select a size',
        sizes,
        (i, data) => `${i}: ${data[i].name} - +$${data[i].addPrice / 100}\n`);
    } else if (itemMods.length > 0) {
      await chatState.updateState(chatStates.mods);
      await chatState.setMenuItemCtx(menuItem);

      return await this._genOutput(
        chatState,
        'Here are the available item modifications\n\n',
        '\nType your desired modifications separated by a comma (e.g. 0 or 0,2,1)',
        itemMods,
        (i, data) => `${i}: ${data[i].name} - +$${data[i].addPrice / 100}\n`);
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
      return userError;
    }

    const value = await this._translateInputKey(chatState, input);
    if (!value) {
      return userError;
    }

    const orderItem = await chatState.findLastOrderItem();
    const size = await Size.findOne(value);

    orderItem.name += ` ${size.name}`;
    orderItem.price += size.addPrice;
    await orderItem.save();

    const menuItem = await chatState.findMenuItemCtx();
    const itemMods = await menuItem.findItemMods();
    if (itemMods.length > 0) {
      await chatState.updateState(chatStates.mods);
      await chatState.setMenuItemCtx(menuItem);
      return await this._genOutput(
        chatState,
        'Here are the available item modifications\n\n',
        '\nType your desired modifications separated by a comma (e.g. 0 or 0,2,1)',
        itemMods,
        (i, data) => `${i}: ${data[i].name} - +$${data[i].addPrice / 100}\n`);
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
    const orderItem = await chatState.findLastOrderItem();
    const mods = input.split(',');
    for (let i = 0; i < mods.length; i++) { // eslint-disable-line
      if (/^\d$/.test(mods[i]) === false) {
        return userError;
      }

      const value = await this._translateInputKey(chatState, mods[i]);
      if (!value) {
        return userError;
      }

      const itemMod = await ItemMod.findOne(value);
      orderItem.name += ` ${itemMod.name}`;
      orderItem.price += itemMod.addPrice;
    }

    await orderItem.save();
    return await this._transitionToCart(chatState);
  }

  /**
   * Handles transitions from the cart state
   *
   * @param {Object} chatState: user chat state
   * @param {String} input: the user input
   * @returns {String}: output of the state transition
   * @private
   */
  async _cartTransition(chatState, input) {
    /* All cart state commands are contextual or stateless */
    throw (Error('Not implemented', chatState, input));
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
      case /^info$/.test(input):
        return await this._handleContextInfo(chatState);
      default:
        return null;
    }
  }

  /**
   * Checks if the input is a contextual command
   *
   * @param {String} input: user input
   * @returns {boolean}: true if contextual and false otherwise
   * @private
   */
  _isContextual(input) {
    return /^checkout$/.test(input)
      || /^menu$/.test(input)
      || /^info$/.test(input);
  }

  async _handleCheckout(chatState) {
    const orderItems = await chatState.findOrderItems();
    if (orderItems.length === 0) {
      return 'You can\'t checkout with an empty cart';
    }

    let output = '';
    let total = 0;
    for (let i = 0; i < orderItems.length; i++) {
      output += orderItems[i].name;
      total += orderItems[i].price;
    }

    await chatState.clearOrderItems();
    await chatState.updateState(chatStates.start);
    /* TODO -- transfer order items over to permanent order object
     * what should I return for the payment processing? */
    return `Your order of ${output.slice(0, -1)} for a total of $${total / 100} has been placed`;
  }

  async _handleContextMenu(chatState) {
    const restaurant = await chatState.findRestaurantCtx();
    return await this._handleAtRestaurantMenu(chatState, restaurant.name);
  }

  async _handleContextInfo(chatState) {
    const restaurant = await chatState.findRestaurantCtx();
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
      || /^help$/.test(input)
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
      case /^help$/.test(input):
        return await this._handleHelp();
      default:
        return null;
    }
  }

  async _handleClear(chatState) {
    await chatState.clearOrderItems();
    return 'Your cart is cleared';
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
      'Try these restaurants!\n\n',
      '\nType \"more\" for more restaurants or type a number to select a restaurant',
      restaurants,
      (i, data) => `${i}) ${data[i].name}\n`);
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
    const categories = await restaurant.findCategories();
    const menuItems = await categories[0].findMenuItems(); // TODO - curate items
    await chatState.updateState(chatStates.items);
    await chatState.setRestaurantCtx(restaurant);
    return await this._genOutput(
      chatState,
      'Try these items!\n\n',
      '\nType a number to select a dish or type \"menu\" to see the entire menu',
      menuItems,
      (i, data) => `${i}) ${data[i].name} - $${data[i].basePrice / 100}\n`);
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
    const categories = await restaurant.findCategories();
    await chatState.updateState(chatStates.categories);
    await chatState.setRestaurantCtx(restaurant);
    return await this._genOutput(
      chatState,
      'Here are the menu categories\n\n',
      '\nType a number to select a category',
      categories,
      (i, data) => `${i}) ${data[i].name}\n`);
  }

  /**
   * Handles state transition of "@<restaurant> info" command
   *
   * @param {String} input: user input restaurant name
   * @returns {String}: output of the transition
   * @private
   */
  async _handleAtRestaurantInfo(input) {
    let output = '';
    const restaurant = await Restaurant.findByName(input);
    const location = await restaurant.findLocation();
    output += `Location: ${location.address} ${location.city}, ${location.state} ${location.zipcode}\n\n`;

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
    return 'Here are a list of valid commands:\n' +
      '\"restaurants\" - browse restaurants' +
      '\"@<name>\" - browse specific restaurant' +
      '\"@<name> menu\" - browse menu of specific restaurant' +
      '\"@<name> info\" - browse info of specific restaurant' +
      '\"help\" - this command' +
      'For example, type \"@homeslice info\" for information about homeslice';
  }

  async _handleClear(chatState) {
    await chatState.clearOrderItems();
    return 'Your cart has been cleared';
  }

  async _genOutput(chatState, header, footer, data, dataFunc) {
    await chatState.clearCommandMaps();
    let output = header;

    for (let i = 0; i < data.length; i++) {
      await chatState.insertCommandMap(i, data[i].id);
      output += dataFunc(i, data);
    }

    return output + footer;
  }

  async _transitionToCart(chatState) {
    const orderItems = await chatState.findOrderItems();
    await chatState.updateState(chatStates.cart);
    await chatState.clearMenuItemCtx();
    return await this._genOutput(
      chatState,
      'Here is your item cart\n',
      'Type \"checkout\" to complete your order, \"menu\" to keep browsing, ' +
      'or \"undo\" to remove the last item',
      orderItems,
      (i, data) => `${i}: ${data[i].name} - $${data[i].price / 100}\n`);
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
