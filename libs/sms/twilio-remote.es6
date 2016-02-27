import SMS from '../sms.es6';
import Twilio from './twilio.es6';

export class TwilioRemote extends SMS {
  constructor(pubsub) {
    super('ACQUIRE');
    this.pubsub = pubsub;

    this.pubsub.Master.on('twilio-sent', text => console.log(text)); // just so you can see
    this.pubsub.Master.on('twilio-received', text => this._onReceive(text));
  }

  /**
   * Handles all the Twilio responses that are received
   * @param {Object} raw: twilio text metadata
   * @returns {null} void
   * @private
   */
  _onReceive(raw) {
    const smsData = Twilio.createSMSData(raw);
    this.triggerReceived(smsData);
  }

  async send(to, body, verboseLogging = false) {
    to = Twilio.normalize(to);

    if (verboseLogging) {
      console.tag('twilio-remote', 'send').log({to, body});
    }

    const res = await this.pubsub.Master.emit('twilio-send', {to, body});

    if (!res.sid) {
      throw new Error(res.message);
    }

    return Twilio.createSMSData(res);
  }

  changeFromNumber() {
    // not possible
  }
}

export default TwilioRemote;
