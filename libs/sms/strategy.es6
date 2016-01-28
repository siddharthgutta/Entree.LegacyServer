export default class SMSStrategy {
  constructor(fromNumber) {
    this.fromNumber = fromNumber;
  }

  send(toNumber, textBody) {
    throw new Error('Not implemented');
  }

  changeFromNumber(newFromNumber) {
    throw new Error('Not implemented');
  }

  // Unnecessary for now
  normalize(toNumber) {
    throw new Error('Not implemented');
  }
}