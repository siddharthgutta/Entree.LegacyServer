/**
 * Created by kfu on 4/14/16.
 */

import MessageDataStrategy from './strategy.es6';

export default class GenericMessageData extends MessageDataStrategy {
  /**
   * Constructor for Generic Message Data
   * @returns {GenericMessageData} generic message data object
   */
  constructor() {
    super();
    this.elements = [];
    this.messageData = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: this.elements
        }
      }
    };
  }

  /**
   * Adding an element to the message data object
   * Note: 10 element cap, 3 buttons per element
   *
   * @param {String} title: REQUIRED bubble title - 45 character limit
   * @param {String} subtitle: OPTIONAL bubble subtitle - 80 character limit
   * @param {String} imageUrl: OPTIONAL url of the bubble image to appear
   * @param {String} itemUrl: OPTIONAL url that is opened when bubble is tapped
   * @return {Null} unused return statement
   */
  pushElement(title, subtitle = null, imageUrl = null, itemUrl = null) {
    this.elements.push({title, subtitle, image_url: imageUrl, item_url: itemUrl, buttons: []});
  }

  /**
   * Adding button to an element at a specific index in the elements array
   *
   * @param {Object} buttonData: data of the button to be added
   * @param {Number} index: index representing the element in the element array
   * @private
   * @return {Null} unused return statement
   */
  _pushButton(buttonData, index) {
    if (index >= this.elements.length) {
      throw new Error('Cannot add a button to an element that does not exist');
    }
    this.elements[index].buttons.push(buttonData);
  }

  /**
   * Adding a postback button to an element at a specific index in the elements array
   *
   * @param {String} title: REQUIRED button title - 20 character limit
   * @param {String} payload: REQUIRED data that will be sent back to us via webhook, when clicked
   * @param {String} index: index representing the element in the element array
   * @return {Null} unused return statement
   */
  pushPostbackButton(title, payload, index = this.elements.length - 1) {
    this._pushButton({
      type: 'postback',
      title,
      payload
    }, index);
  }

  /**
   * Adding a link button to an element at a specific index in the elements array
   *
   * @param {String} title: REQUIRED button title - 20 character limit
   * @param {String} url: REQUIRED url is opened in a mobile browser when the button is tapped
   * @param {String} index: index representing the element in the element array
   * @return {Null} unused return statement
   */
  pushLinkButton(title, url, index = this.elements.length - 1) {
    this._pushButton({
      type: 'web_url',
      title,
      url
    }, index);
  }
}
