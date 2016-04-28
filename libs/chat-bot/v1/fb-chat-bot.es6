/* Disabling lint rule since it doesn't make sense */
/* eslint-disable babel/generator-star-spacing,one-var,valid-jsdoc */

import {GenericMessageData, TextMessageData, ReceiptMessageData, ButtonMessageData}
  from '../../msg/facebook/message-data.es6';
import _ from 'underscore';

export const actions = {
  menu: 'Menu',
  addItem: 'AddItem',
  next: 'Next',
  orderAgain: 'OrderAgain',
  moreInfo: 'MoreInfo',
  wishListAdd: 'WishListAdd'
};

export const events = {
  postback: 'Postback',
  text: 'Text',
  attachment: 'Attachment'
};

export const orders = [];

export const menuItems = [
  {
    id: 1,
    name: 'Cheese Burger',
    description: 'Beef with Cheese',
    price: 100,
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cheeseburger.jpg/1024px-Cheeseburger.jpg'
  },
  {
    id: 2,
    name: 'Pizza',
    description: 'Pepperoni',
    price: 100,
    photoUrl: 'http://www.mysticpizza.com/admin/resources/pizza-pepperoni-w857h456.jpg'
  }
];

export default class FbChatBot {
  constructor() {
    /* Empty Constructor */
  }

  _genPayload(action, attachment = {}) {
    return JSON.stringify({action, attachment});
  }

  _getAction(payload) {
    return payload.action;
  }

  _getAttachment(payload) {
    return payload.attachment;
  }

  /**
   * Processes the input event and creates response for user
   *
   * @param {Object} event: input event from FB messenger
   * @returns {Object}: Messenger response to user
   */
  async handleInput(event) {
    switch (this._getEventType(event)) {
      case events.postback:
        return await this._handlePostback(event);
      case events.text:
        return await this._handleText(event);
      case events.attachment:
        return await this._handleAttachment(event);
      default:
        throw Error();
    }
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

    if (events.message && event.message.attachments) {
      return events.attachment;
    }

    return null;
  }

  /**
   * Handles postback events
   *
   * @param {Object} event: input event from messenger
   * @returns {Object}: messenger output
   */
  async _handlePostback(event) {
    const payload = JSON.parse(event.postback.payload);
    switch (this._getAction(payload)) {
      case actions.menu: {
        const response = new GenericMessageData();

        _.each(menuItems, item => {
          response.pushElement(item.name, item.description, item.photoUrl);
          response.pushPostbackButton('Add to Cart', actions.addItem);
        });

        return [response];
      }
      case actions.addItem: {
        const text = new TextMessageData('Here\`s what your receipt might look at');
        const response = new ReceiptMessageData('Your Name', '12345678902', 'USD', 'Visa 2345',
          'http://petersapparel.parseapp.com/order?order_id=123456', '1428444852');
        const button = new ButtonMessageData('Now let\'s show you what else you can do with Entree');
        button.pushPostbackButton('Next', actions.orderAgain);

        return [text, response, button];
      }
      case actions.orderAgain: {
        const text = new TextMessageData('Here are my last few orders. I can reorder these' +
          ' with a tough of a button. Click \'Order Again\' for any of these');

        const response = new GenericMessageData();
        _.each(orders, order => {
          response.pushElement(order.restaurant, order.description);
          response.pushPostbackButton('Order Again', actions.wishListAdd);
        });
        return [response, text];
      }
      case actions.wishListAdd: {
        const textFirst = new TextMessageData('Now the order has been sent directly to the restaurant. ' +
          'We let you know when your order is ready. This feature is coming soon to your favorite restaurants. ');
        const textLast = new TextMessageData('In the meantime, tell us your three favorite restaurants. ' +
          'We’ll notify you when you can order food or get a great deal there. Please separate them with a comma ' +
          '(Ex: Chick-fil-a, In-n-out, Chipotle)');
        return [textFirst, textLast];
      }
      case actions.moreInfo:
        break;
      default:
        throw Error();
    }
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
    throw Error('Not Implemented', fbId);
  }

  /**
   * Handles text events
   *
   * @param {Object} event: input event from messenger
   * @returns {Object}: messenger output
   */
  async _handleText(event) {
    const text = event.message.text;
    if (/^\d{5}$/.test(text)) {
      return await this._updateUserLocation(event);
    }

    if (this._hasWishlist()) {
      return await this._handleSearch(event);
    }

    return await this._handleWishList(event);
  }

  /**
   * Handles attachment events
   *
   * @param {Object} event: input event from messenger
   * @returns {Object}: messenger output
   */
  async _handleAttachment(event) {
    /* The only attachment we are handling right now is location */
    return await this._updateUserLocation(event);
  }

  async _handleSearch(event) {
    throw Error('Not Implemented', event);
  }

  /**
   * Updates a user's wishlist
   *
   * @param {Object} event: input event from messenger
   * @returns {Object}: messenger output
   */
  async _handleWishList(event) {
    throw Error('Not Implemented', event);
  }

  /**
   * Updates a user's location
   *
   * @param {Object} event: input event from messenger
   * @returns {Object}: messenger output
   */
  async _updateUserLocation(event) {
    throw Error('Not Implemented', event);
  }
}
