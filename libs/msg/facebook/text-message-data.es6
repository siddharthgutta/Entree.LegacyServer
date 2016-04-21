/**
 * Created by kfu on 4/14/16.
 */

import MessageDataStrategy from './strategy.es6';

export default class TextMessageData extends MessageDataStrategy {
  constructor(text) {
    super();
    this.messageData = {text};
  }
}
