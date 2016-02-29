import EventEmitter from 'events';

export class SMSData {
  constructor({id, to, from, body, date, status}) {
    if (!(id && to && from && body && date && status)) {
      throw new Error('Invalid input to build SMSData');
    }

    if (to.indexOf('+') < 0 || from.indexOf('+') < 0) {
      throw new Error('To and From must contain area code', to, from);
    }

    this.id = id;
    this.to = to;
    this.from = from;
    this.body = body;
    this.status = status;
    this.date = date;
  }
}

export default class SMS extends EventEmitter {
  static RECEIVED = 'text-received';
  static SMSData = SMSData;

  constructor(fromNumber) {
    super();
    this.fromNumber = fromNumber;
  }

  /**
   * Functions must pass this method
   * @param {SMSData} text: text input
   * @returns {null} void
   */
  triggerReceived(text) {
    if (!text instanceof SMSData) {
      throw new Error('Text is not of type SMSData');
    }

    this.emit(SMS.RECEIVED, text);
  }

  send(toNumber, textBody) {
    throw new ReferenceError('Not implemented', toNumber, textBody);
  }

  changeFromNumber(newFromNumber) {
    throw new ReferenceError('Not implemented', newFromNumber);
  }
}
