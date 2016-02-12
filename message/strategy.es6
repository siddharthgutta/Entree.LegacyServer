/**
 * Created by kfu on 2/12/16.
 */
import SocketTable from './socket-table.es6';

export default class Strategy {
  constructor() {
    this.st = new SocketTable();
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
