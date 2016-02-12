/**
 * Created by kfu on 2/12/16.
 */

export default class Strategy {
  constructor(mainPort) {
    this.port = mainPort;
  }

  init() {
    throw new Error('Not implemented');
  }

  disconnect(token) {
    throw new Error('Not implemented', token);
  }
}
