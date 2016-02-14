import EventEmitter from 'events';

export default class Master extends EventEmitter {
  constructor(debug = true) {
    super();

    this.debug = debug;

    this.on('error', err => console.error(err));
  }

  // privatizing emit
  _emit(...args) {
    return super.emit(...args);
  }

  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }

  listen(cb = () => 0) {
    throw new Error('Not implemented', cb);
  }

  disconnect(token) {
    throw new Error('Not implemented', token);
  }

  send(channel, data) {
    throw new Error('Not implemented', channel, data);
  }
}
