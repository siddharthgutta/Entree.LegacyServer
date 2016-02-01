import Strategy from './strategy.es6';
import twilio from 'twilio';
import Promise from 'bluebird';

export default class Twilio extends Strategy {
  constructor(from, account, auth) {
    super(from);
    this.client = twilio(account, auth);
    console.tag('lib', 'twilio').log('Client Created with From Number: ', from);
  }

  send(toNumber, textBody, verboseLogging = false) {
    if (verboseLogging) {
      console.tag('lib', 'twilio').log('Sent to', toNumber, ':', textBody);
    }

    return new Promise((resolve, reject) => {
      this.client.messages.create({
        body: textBody,
        to: toNumber,
        from: this.fromNumber
      }, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
  }

  // Currently only used by testing since we only have one twilio number
  changeFromNumber(newFromNumber) {
    this.fromNumber = newFromNumber;
  }

  // Unnecessary for now
  normalize(toNumber) {
    return `+1${String(toNumber).replace('+1', '')}`;
  }
}
