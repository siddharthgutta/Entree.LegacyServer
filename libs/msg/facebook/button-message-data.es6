/**
 * Created by kfu on 4/14/16.
 */

import MessageDataStrategy from './strategy.es6';

export default class ButtonMessageData extends MessageDataStrategy {
  /**
   * Constructor for Button Message Data
   *
   * @param {String} text: text that will appear in the message body
   * @returns {ButtonMessageData} button message data object
   */
  constructor(text) {
    super();
    this.buttons = [];
    this.messageData = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text,
          buttons: this.buttons
        }
      }
    };
  }

  /**
   * Add a button to the buttons array
   *
   * @param {Object} buttonData: data of the button to be added
   * @private
   * @return {Null} unused return statement
   */
  _pushButton(buttonData) {
    this.buttons.push(buttonData);
  }

  /**
   * Adding a postback button the buttons array
   *
   * @param {String} title: REQUIRED button title
   * @param {String} payload: REQUIRED data that will be sent back to us via webhook, when clicked
   * @return {Null} unused return statement
   */
  pushPostbackButton(title, payload) {
    this._pushButton({
      type: 'postback',
      title,
      payload
    });
  }

  /**
   * Adding a link button to the buttons array
   *
   * @param {String} title: REQUIRED button title
   * @param {String} url: REQUIRED url is opened in a mobile browser when the button is tapped
   * @return {Null} unused return statement
   */
  pushLinkButton(title, url) {
    this._pushButton({
      type: 'web_url',
      title,
      url
    });
  }
}
