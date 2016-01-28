import Strategy from './strategy.es6'
import twilio from 'twilio'

export default class Twilio extends Strategy {
  constructor(from, account, auth) {
    super(from);
    this.client = twilio(account, auth);

    console.tag('lib', 'twilio').log('Created', from);
  }

  send(to, body) {
    console.tag('lib', 'twilio').log(to, body);

    // to = this.normalize(to);

    return new Promise((resolve, reject)=> {
      this.client.messages.create({
        body: body,
        to: to,
        from: this.from
      }, (err, message) => {
        if (err) return reject(err);
        resolve(message);
      });
    });
  }

  normalize(number) {
    return `+1${String(number).replace('+1', '')}`;
  }
}