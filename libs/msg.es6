/**
 * Created by kfu on 4/13/16.
 */

import EventEmitter from 'events';

export class MsgData {
  constructor() {

  }
}

export default class MsgPlatform extends EventEmitter {
  static RECEIVED = 'message-received';
  static MsgData = MsgData;

  constructor() {
    super();
  }

  sendMessage() {
    throw new ReferenceError('Not implemented');
  }
}
