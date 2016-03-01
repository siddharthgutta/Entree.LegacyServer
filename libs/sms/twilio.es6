import SMS from '../sms.es6';
import twilio from 'twilio';
import Promise from 'bluebird';
import {Router} from 'express';
import bodyParser from 'body-parser';

function respond(res) {
  res.set('Content-Type', 'text/xml');
  res.send('<Response></Response>');
}

export default class Twilio extends SMS {
  constructor(from, account, auth) {
    super(from);

    process.env.TWILIO_AUTH_TOKEN = auth;

    this.client = twilio(account, auth);

    console.tag('lib', 'twilio').log('Client Created with From Number: ', from);
  }

  send(toNumber, textBody, verboseLogging = false) {
    if (verboseLogging) {
      console.tag('lib', 'twilio').log('Sent to', toNumber, ':', textBody);
    }

    toNumber = Twilio.normalize(toNumber);

    return new Promise((resolve, reject) => {
      const req = {body: textBody, to: toNumber, from: this.fromNumber};
      this.client.messages.create(req, (err, response) => {
        if (err) return reject(err);
        const smsData = Twilio.createSMSData(response);
        resolve(smsData);
      });
    });
  }

  /**
   * Converts raw Twilio text objects to SMSData
   * @param {Object} raw:
   * @returns {SMSData} validated data structure
   */
  static createSMSData(raw) {
    const id = raw.sid || raw.MessageSid;
    const body = raw.body || raw.Body;
    const status = raw.status || raw.SmsStatus;
    const from = raw.from || raw.From;
    const to = raw.to || raw.To;
    let date = raw.date || new Date(raw.dateCreated);

    if (isNaN(date)) {
      date = new Date();
    }

    return new SMS.SMSData({id, to, from, body, status, date});
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

  /**
   * Webhook for Twilio messages for provided credentials
   * @returns {Router} Express router
   * @note bodyParser.urlencoded({extended: true}
   */
  router() {
    const route = new Router();
    route.use(bodyParser.urlencoded({extended: true}));

    route.post('/receive', twilio.webhook(), async (req, res) => {
      console.tag('lib', 'twilio', 'receive').log(res.body);
      respond(res, '');
      this._onReceive(req.body);
    });

    route.post('/fallback', twilio.webhook({validate: false}), (req, res) => {
      console.tag('lib', 'twilio', 'fallback').log(res.body);
      respond(res, '');
      this._onReceive(req.body);
    });

    return route;
  }

  // Currently only used by testing since we only have one twilio number
  changeFromNumber(newFromNumber) {
    this.fromNumber = newFromNumber;
  }

  /**
   * Formats a number to match Twilio's expectations
   * @param {String} to: telephone number
   * @returns {String} formatted number
   * @note accepts US numbers ONLY
   */
  static normalize(to) {
    return `+1${String(to).replace('+1', '')}`;
  }
}
