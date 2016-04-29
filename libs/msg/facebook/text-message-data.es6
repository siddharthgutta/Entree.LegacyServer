/**
 * Created by kfu on 4/14/16.
 */

import MessageDataStrategy from './strategy.es6';

export default class TextMessageData extends MessageDataStrategy {
  /**
   * Constructor for Text Message Data
   *
   * @param {String} text: 320 character limited text message
   * @returns {TextMessageData} generic message data object
   */
  constructor(text) {
    super();
    this.messageData = {text};
  }
}
