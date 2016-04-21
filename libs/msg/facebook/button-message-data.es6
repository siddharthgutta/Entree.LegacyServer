/**
 * Created by kfu on 4/14/16.
 */

import MessageDataStrategy from './text-message-data.es6';

export default class ButtonMessageData extends MessageDataStrategy {
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

  _pushButton(buttonData) {
    this.buttons.push(buttonData);
  }

  pushPostbackButton(title, payload) {
    this._pushButton({
      type: 'postback',
      title,
      payload
    });
  }

  pushLinkButton(title, url) {
    this._pushButton({
      type: 'web_url',
      title,
      url
    });
  }
}
