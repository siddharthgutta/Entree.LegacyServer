export default class SMSStrategy {
  constructor(fromNumber) {
    this.fromNumber = fromNumber;
  }

  send(toNumber, textBody) {
    throw new Error('Not implemented', toNumber, textBody);
  }

  changeFromNumber(newFromNumber) {
    throw new Error('Not implemented', newFromNumber);
  }

  // Unnecessary for now
  normalize(toNumber) {
    throw new Error('Not implemented', toNumber);
  }
}
