/* Disabling lint rule since it doesn't make sense. */
/* eslint-disable babel/generator-star-spacing,one-var,valid-jsdoc */

import config from 'config';
import _ from 'underscore';
import * as User from '../../../api/controllers/user.es6';
import {GoogleMapsGeocoding, GooglePlaces} from '../../google/api.es6';
import {GenericMessageData, TextMessageData, ReceiptMessageData, ButtonMessageData}
  from '../../msg/facebook/message-data.es6';

const googleMapsGeocoding = new GoogleMapsGeocoding(config.get('Google.apiKey'));
const googlePlaces = new GooglePlaces(config.get('Google.apiKey'));

export const actions = {
  restaurant: 'Restaurant',
  menu: 'Menu',
  addItem: 'AddItem',
  orderAgain: 'OrderAgain',
  requestLocation: 'RequestLocation',
  search: 'Search',
  moreInfo: 'MoreInfo',
  confirmation: 'Confirmation',
  addToWishList: 'AddToWishList'
};

export const events = {
  postback: 'Postback',
  text: 'Text',
  attachment: 'Attachment',
  delivery: 'Delivery'
};

export const restaurants = [
  {
    title: 'Panera Bread',
    subtitle: 'Fast-casual bakery chain that serves artisanal sandwiches, soups, and more. ' +
      '\nHours: 6AM-9PM \nRating: 4.5',
    imageUrl: 'https://i.imgur.com/iEwGMjv.jpg'
  },
  {
    title: 'Chipotle',
    subtitle: 'Mexican fast-casual chain serving custom-made burritos and bowls. ' +
      '\nHours: 11AM-10PM\nRating: 4.4',
    imageUrl: 'https://i.imgur.com/AC2PjhS.jpg'
  },
  {
    title: 'Chi\'lantro',
    subtitle: 'Austin, Texas based Korean-Mexican fusion with multiple food trucks and restaurants. ' +
      '\nHours: 10:30AM - 10PM\nRating: 4.8',
    imageUrl: 'https://i.imgur.com/j0W2jbo.jpg'
  }
];

export const menus = {
  'Panera Bread': [
    {
      title: 'Italian Combo On Ciabatta',
      subtitle: 'roast beef, smoked turkey, ham, salami, swiss, peperoncini, lettuce, tomatoes, ' +
        'onions & our special spread',
      imageUrl: 'https://i.imgur.com/QdQTJu9.jpg',
      price: 8.59
    },
    {
      title: 'Roasted Turkey Fuji Apple Salad',
      subtitle: 'mixed field greens, romaine, tomatoes, onions, pecans, gorgonzola, apple chips & white ' +
        'balsamic fuji apple vinaigrette',
      imageUrl: 'https://i.imgur.com/GCUzQNX.jpg',
      price: 8.99
    }
  ],
  'Chipotle': [ // eslint-disable-line quote-props
    {
      title: 'Chicken Burrito',
      subtitle: 'with brown rice, shredded cheese, pico de gallo, and guacamole',
      imageUrl: 'https://i.imgur.com/LEuvROh.jpg',
      price: 8.30
    },
    {
      title: 'Vegetarian Bowl',
      subtitle: 'with brown rice, vegetable fajitas, pico de gallo, sour cream, lettuce, and hot sauce',
      imageUrl: 'https://i.imgur.com/4lhY42l.jpg',
      price: 6.50
    }
  ],
  'Chi\'lantro': [
    {
      title: 'The Original Kimchi Fries',
      subtitle: 'choice of protein, caramelized kimchi, cheddar + monterey jack, onions, cilantro, ' +
        'magic sauce, sesame seeds, sriracha',
      imageUrl: 'https://i.imgur.com/XDda2St.jpg',
      price: 7.49
    },
    {
      title: 'Rice Bowl',
      subtitle: 'lime buttered rice or brown rice, black beans, grilled corn, garden veggies, kimchi, ' +
        'fried egg, house made salsa',
      imageUrl: 'https://i.imgur.com/KGjmUB0.jpg',
      price: 7.49
    }
  ]
};

export default class FbChatBot {
  constructor(msgPlatform) {
    this.msgPlatform = msgPlatform;

    // Delete a current conversation of Messenger (only on Desktop Messenger)
    // Then, search for the bot you are trying to have a conversation with
    // Then, the welcome message should be shown
    /* Setup welcome message */
    const welcomeMessage = new ButtonMessageData('Hi I\'m Entrée! I help you order food, get great deals, and find ' +
      'new places to eat. We\'re currently in Beta, but press start to see what you can do with Entrée!');
    welcomeMessage.pushPostbackButton('Start', this._genPayload(actions.restaurant));
    msgPlatform.setWelcomeMessage(welcomeMessage.toJSON());
  }

  /**
   * Processes the input event and creates response for user
   *
   * @param {Object} event: input event from FB messenger
   * @returns {Object}: Messenger response to user
   */
  async handleInput(event) {
    const user = await this._findUser(event);

    let output;
    switch (this._getEventType(event)) {
      case events.postback:
        output = await this._handlePostback(event, user);
        break;
      case events.text:
        output = await this._handleText(event, user);
        break;
      case events.attachment:
        output = await this._handleAttachment(event, user);
        break;
      case events.delivery:
        // This is an event that just tells us our delivery succeeded
        // We already get this in the response of the message sent
        output = [];
        break;
      default:
        console.tag('libs', 'chat-bot', 'v1', 'fb-chat-bot', 'INPUT ERROR').log(event);
        throw Error(`Error handing event input for event`);
    }
    return output;
  }

  /**
   * Returns the event type
   *
   * @param {Object} event: input event from messenger
   * @returns {String}: the event type
   * @private
   */
  _getEventType(event) {
    if (event.postback) {
      return events.postback;
    }

    if (event.message && event.message.text) {
      return events.text;
    }

    if (event.message && event.message.attachments) {
      return events.attachment;
    }

    if (event.delivery) {
      return events.delivery;
    }

    return null;
  }

  _genPayload(action, attachment) {
    return JSON.stringify({action, attachment});
  }

  _getAction(payload) {
    return payload.action;
  }

  _getAttachment(payload) {
    return payload.attachment;
  }

  async _findUser(event) {
    const sender = event.sender.id;
    const user = await User.UserModel.findOneByFbId(sender);

    if (user) {
      return user;
    }

    const profile = await this.msgPlatform.getFacebookProfileInfo(sender);
    const newUser = await User.UserModel.createFbUser(sender, profile.first_name, profile.last_name);
    return newUser;
  }

  /**
   * Handles postback events
   *
   * @param {Object} event: input event from messenger
   * @param {Object} user: user that sent the event
   * @returns {Object}: messenger output
   */
  async _handlePostback(event, user) {
    let payload, action;
    try {
      payload = JSON.parse(event.postback.payload);
      action = this._getAction(payload);
    } catch (err) {
      throw new TraceError('Could not get payload or action for event', err);
    }

    switch (action) {
      case actions.restaurant:
        return this._handleRestaurant();
      case actions.menu:
        return await this._handleMenu(payload);
      case actions.addItem:
        return this._handleAddItem(payload, user);
      case actions.orderAgain:
        return this._handleOrderAgain(payload);
      case actions.confirmation:
        return await this._handleConfirmation();
      case actions.requestLocation:
        return await this._handleRequestLocation();
      case actions.search:
        return await this._handleSearch();
      case actions.moreInfo:
        break;
      default:
        throw Error();
    }
  }

  async _handleRestaurant() {
    let text, response;
    try {
      text = new TextMessageData('Entrée\'s lets you order ahead at your favorite restaurants. Here are some ' +
        'of my usual restaurants. Click \'View Menu\' to see items from a restaurant.');

      response = new GenericMessageData();
      _.each(restaurants, restaurant => {
        response.pushElement(restaurant.title, restaurant.subtitle, restaurant.imageUrl);
        response.pushPostbackButton('View Menu', this._genPayload(actions.menu, {restaurant}));
      });
    } catch (err) {
      throw new TraceError('Failed to generate restaurants', err);
    }

    return [text, response];
  }

  async _handleMenu(payload) {
    /* Get the actual restaurant menu */
    let text, response;
    try {
      text = new TextMessageData('Once you select a restaurant, we\'ll show you menu items that you can order. ' +
        'Here are two menu items. Click \'Add to Cart\' to see how your receipt will look like.');

      response = new GenericMessageData();
      const restaurant = this._getAttachment(payload).restaurant; // eslint-disable-line
      const restaurantMenuItems = menus[restaurant.title];

      _.each(restaurantMenuItems, item => {
        response.pushElement(item.title, item.subtitle, item.imageUrl);
        response.pushPostbackButton('Add to Cart', this._genPayload(actions.addItem, {item, restaurant}));
      });
    } catch (err) {
      throw new TraceError('Failed to generate menu items', err);
    }
    return [text, response];
  }

  async _handleAddItem(payload, user) {
    let response, button;
    try {
      const item = this._getAttachment(payload).item;
      const restaurant = this._getAttachment(payload).restaurant;

      response = new ReceiptMessageData(`${user.firstName} ${user.lastName}`,
        user.receiptCount.toString(), 'USD', 'Visa 2345');

      response.pushElement(`${item.title} from ${restaurant.title}`, 1, item.price, 'USD', item.imageUrl,
        item.subtitle);
      response.addSummary(item.price);

      button = new ButtonMessageData('This is what your receipt might look like. Now let\'s show you what else ' +
        'you can do with Entrée.');
      button.pushPostbackButton('Show Me More', this._genPayload(actions.orderAgain, {item, restaurant}));
    } catch (err) {
      throw new TraceError('Failed to generate receipt', err);
    }

    try {
      /* Increment receipt count */
      await User.UserModel.update(user.id, {receiptCount: user.receiptCount + 1});
    } catch (err) {
      throw new TraceError(`Failed to increment receipt count for user ${user.id}`, err);
    }

    return [response, button];
  }

  async _handleOrderAgain(payload) {
    let text, response;
    try {
      text = new TextMessageData('Entrée\'s coolest feature is that we let you save your previous orders and let' +
        ' you re-order in a few clicks. For example, here are my last few orders. I can reorder these' +
        ' with a touch of a button. Click \'Order Again\' for any of these.');

      const item = this._getAttachment(payload).item;
      const restaurant = this._getAttachment(payload).restaurant;

      /* Need to format order again better */
      response = new GenericMessageData();
      response.pushElement(restaurant.title, item.title, restaurant.imageUrl);
      response.pushPostbackButton('Order Again', this._genPayload(actions.confirmation));
    } catch (err) {
      throw new TraceError('Failed to generate order again message', err);
    }
    return [text, response];
  }

  async _handleConfirmation() {
    let button;
    try {
      button = new ButtonMessageData('It\'s that easy! Now your reorder has been sent directly to the restaurant.' +
        ' With Entrée, we also notify you when your order is ready for pickup. All of these features are coming ' +
        'soon to your favorite restaurants. Click \'Continue\' to see what Entrée can do for you right now.');
      button.pushPostbackButton('Continue', this._genPayload(actions.search));
    } catch (err) {
      throw new TraceError('Failed to generate continue message', err);
    }

    return [button];
  }

  async _handleRequestLocation() {
    let text;
    try {
      text = new TextMessageData('Now, you can search for restaurants near you. First, send us your location:' +
        '.\n1. For Android, click the \'…\' button, press \'Location\', and then press the send button\n' +
        '2. For iOS, tap the location button\n3. If you\'re on desktop, ' +
        'just type in your zip code (Ex: 78705)');
    } catch (err) {
      throw new TraceError('Failed to generate search message', err);
    }

    return [text];
  }

  async _handleSearch() {
    let text;
    try {
      text = new TextMessageData('Thanks! For now, I can search for restaurants near you. Type any keyword to ' +
        'start (Ex: chipotle, thai food, etc.). Feel free to add more restaurants to your wishlist so I can tell ' +
        'you when you can order ahead and get great deals.');
    } catch (err) {
      throw new TraceError('Failed to generate search message', err);
    }

    return [text];
  }

  /**
   * Checks if a user has a wish list
   *
   * @param {String} fbId: FB ID of the user
   *
   * @private
   * @returns {Boolean}: true if wishlist exists and false otherwise
   */
  async _hasWishlist(fbId) {
    const wishList = await User.UserModel.findWishList(fbId);
    if (wishList && wishList.length > 0) {
      return true;
    }

    return false;
  }


  async _search(event, user) {
    if (!(await this._hasWishlist(user.fbId))) {
      return await this._handleInitialWishList(event, user);
    }

    const location = await User.UserModel.getDefaultLocation(user.fbId);

    const inputText = event.message.text.trim();
    const searchResult = await googlePlaces.searchByName(inputText, location.latitude, location.longitude);

    const response = new GenericMessageData();
    for (let idx = 0; idx < 5 && idx < searchResult.length; idx++) {
      response.pushElement(response[0].name);
      response.pushPostbackButton('Add to Wish list', this._genPayload(actions.addToWishList));
    }

    return [response];
  }

  /**
   * Handles text events
   *
   * @param {Object} event: input event from messenger
   * @param {Object} user: user that sent the event
   * @returns {Object}: messenger output
   */
  async _handleText(event, user) {
    const text = event.message.text;
    if (/^\d{5}$/.test(text)) {
      return await this._updateUserLocation(event, user);
    }

    return await this._search(event, user);
  }

  /**
   * Handles attachment events
   *
   * @param {Object} event: input event from messenger
   * @returns {Object}: messenger output
   */
  async _handleAttachment(event, user) {
    /* The only attachment we are handling right now is location */
    return await this._updateUserLocation(event, user);
  }

  /**
   * When the user types in his or her favorite 3 restaurants
   *
   * @param {Object} event: input event from messenger
   * @returns {Object}: messengerPlace output
   */
  async _handleInitialWishList(event, user) {
    const inputText = event.message.text;
    const places = inputText.split(',');

    /* Sanitize user input */
    _.map(places, place => place.trim());

    const location = await User.UserModel.getDefaultLocation(user.fbId);
    const response = new GenericMessageData();
    const button = new ButtonMessageData('We have added the following restaurants to your wish list');
    button.pushPostbackButton('Continue', this._genPayload(actions.search));

    for (const idx in places) { // eslint-disable-line
      const result = await googlePlaces.searchByName(places[idx], location.latitude, location.longitude);
      const place = result[0];
      await User.UserModel.addToWishList(user.fbId, place.place_id);
      response.pushElement(place.name);
    }

    return [button, response];
  }

  /**
   * Updates a user's location
   *
   * @param {Object} event: input event from messenger
   * @returns {Object}: messenger output
   */
  async _updateUserLocation(event, user) {
    const inputText = event.message.text;
    if (inputText) { /* In this case the input is a zip code */
      try {
        const location = await googleMapsGeocoding.getLocationFromZipcode(inputText);
        await User.UserModel.addLocation(user.fbId, location.lat, location.lng);
      } catch (err) {
        throw new TraceError('Failed to update user location with zipcode', err);
      }
    } else { /* In this case the input is a location attachment sent from mobile */
      let attachment;
      try {
        attachment = event.message.attachments[0];
        if (attachment.type === 'location') {
          await User.UserModel.addLocation(user.fbId, attachment.payload.coordinates.lat,
            attachment.payload.coordinates.long);
        } else {
          console.tag('libs', 'chat-bot', 'v1', 'fb-chat-bot', 'ATTACHMENT ERROR').log(attachment);
          throw Error(`Attachment did not contain location`);
        }
      } catch (err) {
        throw new TraceError('Failed to update user location with attachment', err);
      }
    }

    const text = new TextMessageData('Thanks! Now tell me your three favorite restaurants where you want to ' +
      'order from.  I will notify you when you can order food or get a great deal from there. Please separate ' +
      'them with a comma (Ex: Chick-fil-a, In-n-out, Chipotle)');
    return [text];
  }
}
