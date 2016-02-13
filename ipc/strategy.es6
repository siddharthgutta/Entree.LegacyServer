/**
 * Created by kfu on 2/12/16.
 */

const EventEmitter = require('events');

export default class Strategy {
  constructor(mainPort) {
    this.port = mainPort;
    this.emitter = new EventEmitter();
  }

  init() {
    throw new Error('Not implemented');
  }

  disconnect(token) {
    throw new Error('Not implemented', token);
  }
}
