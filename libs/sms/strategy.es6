export default class Strategy {
  constructor(from) {
    this.from = from;
  }

  send(to, data) {
    throw new Error('Not implemented');
  }

  normalize(to) {
    throw new Error('Not implemented');
  }
}