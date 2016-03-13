/**
 * Created by kfu on 3/10/16.
 */

import slack from '@slack/client';
import NotifierStrategy from './strategy.es6';
import _ from 'underscore';

export default class Slack extends NotifierStrategy {
  /**
   * Initialize Slack Bot
   *
   * @param {String} apiToken: bot api token
   * @param {String} username: username in slack channel
   * @returns {Slack}: slack bot object
   */
  constructor(apiToken, username) {
    super();
    this.username = username;
    this.webClient = new slack.WebClient(apiToken);
  }

  /**
   * Send message on slack channel
   *
   * @param {String} channelId: channel id of slack
   * @param {Object} data: Slack data object
   * @param {String} msg: message to be sent, set to null if using data
   * Can find the channel id from the following:
   * https://api.slack.com/methods/channels.list/test
   *
   * @returns {null}: returns nothing
   */
  send(channelId, data, msg) {
    _.extendOwn(data, {username: this.username, as_user: true});
    return this.webClient.chat.postMessage(channelId, msg, data, () => undefined);
  }

  /**
   * Generates data for sending message
   *
   * @param {String} fallback: fallback message if fails
   * @param {String} color: color of side line
   * @param {Array} fields: Slack Post fields
   * @param {Boolean} test: whether or not running a test
   * @returns {{attachments: *[]}}: data object for slack
   */
  static generateData(fallback, color, fields, test) {
    const attachmentList = [{fallback, mrkdwn_in: ['pretext'], pretext: test ?
      'TEST DATA' : '_*REAL BRAINTREE DATA*_', color, fields}];
    // API Requires using JSON.stringify here
    // SLACK GITHUB ISSUE
    // https://github.com/slackhq/node-slack-client/issues/172
    return {attachments: JSON.stringify(attachmentList)};
  }

  /**
   * Generates field for slack messages
   *
   * @param {String} title: field title
   * @param {String} value: field contents
   * @param {Boolean} short: short field
   * @returns {{title: *, value: *, short: *}}: field object
   */
  static generateField(title, value, short = true) {
    return {title, value, short};
  }
}
