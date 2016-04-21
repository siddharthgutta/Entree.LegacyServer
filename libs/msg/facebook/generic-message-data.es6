/**
 * Created by kfu on 4/14/16.
 */

import MessageDataStrategy from './text-message-data.es6';

export default class GenericMessageData extends MessageDataStrategy {
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

  pushElement(title, subtitle, imageUrl) {
    this.elements.push({title, subtitle, image_url: imageUrl, buttons: []});
  }

  _pushButton(buttonData, index) {
    if (index >= this.elements.length) {
      throw new Error('Cannot add a button to an element that does not exist');
    }
    this.elements[index].buttons.push(buttonData);
  }

  pushPostbackButton(title, payload, index = this.elements.length - 1) {
    this._pushButton({
      type: 'postback',
      title,
      payload
    }, index);
  }

  pushLinkButton(title, url, index = this.elements.length - 1) {
    this._pushButton({
      type: 'web_url',
      title,
      url
    }, index);
  }
}
