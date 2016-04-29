/**
 * Created by kfu on 4/13/16.
 */

import EventEmitter from 'events';

export default class MsgPlatform extends EventEmitter {
  static RECEIVED = 'msg-received';

  constructor() {
    super();
  }

  _handleEvent(event) {
    this.emit(MsgPlatform.RECEIVED, event);
  }
}
