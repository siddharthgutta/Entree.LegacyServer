/**
 * Created by kfu on 4/14/16.
 */

import MessageDataStrategy from './strategy.es6';

export default class ImageMessageData extends MessageDataStrategy {
  /**
   * Constructor for Text Message Data
   *
   * @param {String} url: url of image
   * @returns {TextMessageData} generic message data object
   */
  constructor(url) {
    super();
    this.messageData = {
      attachment: {
        type: 'image',
        payload: {
          url
        }
      }
    };
  }
}
