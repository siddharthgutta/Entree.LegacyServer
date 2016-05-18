/* Disabling lint rule since it doesn't make sense. */
/* eslint-disable babel/generator-star-spacing,one-var,valid-jsdoc */

import _ from 'underscore';
import * as User from '../../../api/controllers/user.es6';
import * as Goog from '../../../api/controllers/google.es6';
import {PlaceTypes} from '../../google/placeType.es6';
import {GenericMessageData, TextMessageData, ReceiptMessageData, ButtonMessageData}
  from '../../msg/facebook/message-data.es6';

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

const placeTypes = [PlaceTypes.restaurant, PlaceTypes.cafe, PlaceTypes.bakery];

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
    const user = await this._findOrCreateUser(event);

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

        break;
      default:
        console.tag('libs', 'chat-bot', 'v1', 'fb-chat-bot', 'INPUT ERROR').log(event);
        throw Error(`Error handing event input for event`);
    }
    return output;
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
      case actions.addToWishList:
        return await this._handleAddToWishList(payload, user);
      case actions.moreInfo:
        return await this._handleMoreInfo(payload);
      default:
        throw Error('Invalid payload action');
    }
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
    /* Assuming user entered in a US zip code */
    if (/^\d{5}$/.test(text)) {
      return await this._updateUserLocation(event, user);
    }

    return await this._search(event, user);
  }

  /**
   * Handles attachment events
   *
   * @param {Object} event: input event from messenger
   * @param {Object} user: user object that sent attachment
   * @returns {Object}: messenger output
   */
  async _handleAttachment(event, user) {
    /* The only attachment we are handling right now is location */
    const attachment = event.message.attachments[0];
    if (attachment.type === 'location') {
      return await this._updateUserLocation(event, user);
    }

    console.tag('libs', 'chat-bot', 'v1', 'fb-chat-bot', 'ATTACHMENT ERROR').log(attachment);
    throw Error(`Attachment did not contain location`);
  }

  /**
   * Executed when the user first starts the walk through
   *
   * @returns {Object}: GenericMessageData containing restaurants
   * @private
   */
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

  /**
   * Executed when user presses the ViewMenu button of a restaurant
   *
   * @param {Object} payload: Restaurant whose menu we are displaying
   * @returns {Object}: GenericMessageData containing the menu items
   * @private
   */
  async _handleMenu(payload) {
    /* Get the actual restaurant menu */
    let text, response;
    try {
      text = new TextMessageData('Once you select a restaurant, we\'ll show you menu items that you can order. ' +
        'Here are two menu items. Click \'Add to Cart\' to see how your receipt will look like.');

      response = new GenericMessageData();
      const restaurant = this._getData(payload).restaurant; // eslint-disable-line
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

  /**
   * Executed when user presses AddItem of a single menu item
   *
   * @param {Object} payload: Contains the item object the user added
   * @param {Object} user: The user who added the item
   * @returns {Object}: ReceiptMessageData of what the receipt looks like and a show me more button
   * @private
   */
  async _handleAddItem(payload, user) {
    let response, button;
    try {
      const item = this._getData(payload).item;
      const restaurant = this._getData(payload).restaurant;

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

  /**
   * Executed when user presses the Show Me More button
   *
   * @param {Object} payload: the item the user previously ordered
   * @returns {Object}: TextMessageData and Button allow user to press OrderAgain
   * @private
   */
  async _handleOrderAgain(payload) {
    let text, response;
    try {
      text = new TextMessageData('Entrée\'s coolest feature is that we let you save your previous orders and let' +
        ' you re-order in a few clicks. For example, here are my last few orders. I can reorder these' +
        ' with a touch of a button. Click \'Order Again\' for any of these.');

      const item = this._getData(payload).item;
      const restaurant = this._getData(payload).restaurant;

      /* Need to format order again better */
      response = new GenericMessageData();
      response.pushElement(restaurant.title, item.title, restaurant.imageUrl);
      response.pushPostbackButton('Order Again', this._genPayload(actions.confirmation));
      for (const idx in restaurants) {
        if (restaurants[idx].title !== restaurant.title) {
          response.pushElement(restaurants[idx].title, menus[restaurants[idx].title][0].title,
            restaurants[idx].imageUrl);
          response.pushPostbackButton('Order Again', this._genPayload(actions.confirmation));
        }
      }
    } catch (err) {
      throw new TraceError('Failed to generate order again message', err);
    }
    return [text, response];
  }

  /**
   * Executed after the user presses the Order Again button
   *
   * @returns {Object}: Button containing instructions on what to do next
   * @private
   */
  async _handleConfirmation() {
    let button;
    try {
      button = new ButtonMessageData('It\'s that easy! Now your reorder has been sent directly to the restaurant.' +
        ' With Entrée, we also notify you when your order is ready for pickup. All of these features are coming ' +
        'soon to your favorite restaurants. Click \'Continue\' to see what Entrée can do for you right now.');
      button.pushPostbackButton('Continue', this._genPayload(actions.requestLocation));
    } catch (err) {
      throw new TraceError('Failed to generate continue message', err);
    }

    return [button];
  }

  /**
   * Executed after user presses Continue
   *
   * @returns {Object}: Instructions on how to submit location
   * @private
   */
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

  /**
   * Executed after user enters in Location
   *
   * @returns {Object}: Instructions on how to search
   * @private
   */
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
   * Execute when user taps AddToWishlist button for a specific item
   *
   * @param {Object} payload: Item that user wants to add to wishlist
   * @param {Object} user: User object who added the item
   * @returns {Object}: Returns instructions on next steps
   * @private
   */
  async _handleAddToWishList(payload, user) {
    let button;
    try {
      const placeId = this._getData(payload).placeId;
      if (await User.UserModel.hasWishListPlace(user.fbId, placeId)) {
        return [new TextMessageData('You already have that place on your wishlist!')];
      }

      const details = await Goog.getPlaceDetailsFromPlaceId(placeId);
      await User.UserModel.addToWishList(user.fbId, placeId);

      button = new ButtonMessageData(`${details.name} has been added to your wishlist. I’ll let you know when ` +
        'you can order food or get a great deal. If you want to add any more restaurants, ' +
        'type to search again (Ex: torchy’s tacos, sandwiches, etc.) or you can go through the walkthrough again');
      button.pushPostbackButton('Re-Do Walkthrough', this._genPayload(actions.restaurant));
    } catch (err) {
      throw new TraceError('Failed to add place to wish list', err);
    }

    return [button];
  }

  /**
   * Executed when user presses the MoreInfo button on a specific restaurautn searched
   *
   * @param {Object} payload: Restaurant tht was searched
   * @returns {Object}: Buttons and more text information on the restaurant
   * @private
   */
  async _handleMoreInfo(payload) {
    let button;
    try {
      const placeId = this._getData(payload).placeId;
      const details = await Goog.getPlaceDetailsFromPlaceId(placeId);

      button = new ButtonMessageData(`${details.name} has an average rating of ${details.rating}/5 and you ` +
        `can call them at ${details.formatted_phone_number}`);
      button.pushLinkButton('Location', `${details.url}`);
      button.pushLinkButton('Website', `${details.website}`);
      button.pushPostbackButton('Add to Wish list', this._genPayload(actions.addToWishList, {placeId}));
    } catch (err) {
      throw new TraceError('Could not get detailed information for place', err);
    }

    return [button];
  }

  /**
   * Does the actual searching when user types in text to search
   *
   * @param {Object} event: The event associated with the user input
   * @param {Object} user: User who searched
   * @returns {Object}: Generic message data containing results of the search
   * @private
   */
  async _search(event, user) {
    if (!(await this._hasWishlist(user.fbId))) {
      return await this._handleInitialWishList(event, user);
    }

    let response;
    try {
      const location = await User.UserModel.getDefaultLocation(user.fbId);

      const inputText = event.message.text.trim();
      const searchResults = await Goog.searchPlacesByName(inputText, location.latitude, location.longitude, placeTypes);
      if (searchResults.length === 0) {
        const text = new TextMessageData(`Sorry we could not find anything for ${inputText}. ` +
          `Please try something else`);
        return [text];
      }

      response = new GenericMessageData();
      for (let idx = 0; idx < 10 && idx < searchResults.length; idx++) {
        const place = searchResults[idx];
        const photoUrl =
          place.photos ? await Goog.getShortUrlFromPhotoReference(place.photos[0].photo_reference) : null;
        const details = await Goog.getPlaceDetailsFromPlaceId(place.place_id);
        response.pushElement(place.name,
          `${details.formatted_address} - Price Range: ${'$'.repeat(place.price_level)}`, photoUrl);
        response.pushPostbackButton('More Info', this._genPayload(actions.moreInfo, {placeId: place.place_id}));
        response.pushPostbackButton('Add to Wish list',
          this._genPayload(actions.addToWishList, {placeId: place.place_id}));
      }
    } catch (err) {
      throw new TraceError('Failed during search', err);
    }

    return [response];
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
    _.each(places, place => place.trim());

    let response, button;
    try {
      const location = await User.UserModel.getDefaultLocation(user.fbId);
      response = new GenericMessageData();

      const notFound = [];
      for (let idx = 0; idx < places.length; idx++) { // eslint-disable-line
        const result = await Goog.searchPlacesByName(places[idx], location.latitude, location.longitude);
        if (result.length === 0) {
          notFound.push(places[idx]);
        } else {
          const place = result[0];
          const details = await Goog.getPlaceDetailsFromPlaceId(place.place_id);
          await User.UserModel.addToWishList(user.fbId, place.place_id);
          const photoUrl =
            place.photos ? await Goog.getShortUrlFromPhotoReference(place.photos[0].photo_reference) : null;
          response.pushElement(place.name,
            `${details.formatted_address} - Price Range: ${'$'.repeat(place.price_level)}`, photoUrl);
          response.pushPostbackButton('More Info', this._genPayload(actions.moreInfo, {placeId: place.place_id}));
        }
      }

      if (notFound.length === 0) {
        button = new ButtonMessageData('We have added the above restaurants to your wish list');
      } else {
        button = new ButtonMessageData(`Sorry we could not find anything for ${notFound.join(', ')}, but we have ` +
          `added the above restaurants to your wish list`);
      }

      button.pushPostbackButton('Continue', this._genPayload(actions.search));
    } catch (err) {
      throw new TraceError('Could not create initial wish list response', err);
    }

    return [response, button];
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
        const location = await Goog.getLocationCoordinatesFromZipcode(inputText);
        await User.UserModel.addLocation(user.fbId, location.lat, location.lng);
      } catch (err) {
        throw new TraceError('Failed to update user location with zipcode', err);
      }
    } else { /* In this case the input is a location attachment sent from mobile */
      try {
        const attachment = event.message.attachments[0];
        await User.UserModel.addLocation(user.fbId, attachment.payload.coordinates.lat,
          attachment.payload.coordinates.long);
      } catch (err) {
        throw new TraceError('Failed to update user location with attachment', err);
      }
    }

    const text = new TextMessageData('Thanks! Now tell me your three favorite restaurants where you want to ' +
      'order from.  I will notify you when you can order food or get a great deal from there. Please separate ' +
      'them with a comma (Ex: Chick-fil-a, In-n-out, Chipotle)');
    return [text];
  }

  /**
   * Finds a user and creates one if the user does not exist
   *
   * @param {Object} event: Event corresponding to a user that sent us a message
   * @returns {Promise}: The user found or created
   * @private
   */
  async _findOrCreateUser(event) {
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

  _genPayload(action, data) {
    return JSON.stringify({action, data});
  }

  _getAction(payload) {
    return payload.action;
  }

  _getData(payload) {
    return payload.data;
  }
}
