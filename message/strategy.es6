/**
 * Created by kfu on 2/12/16.
 */
import SocketTable from './socket-table.es6';
const EventEmitter = require('events');

export default class Strategy {
  constructor() {
    this.st = new SocketTable();
    this.emitter = new EventEmitter();
  }

  addToken(token) {
    throw new Error('Not implemented', token);
  }

  init() {
    throw new Error('Not implemented');
  }

  emit(channel, token, data) {
    throw new Error('Not implemented', channel, token, data);
  }
}
