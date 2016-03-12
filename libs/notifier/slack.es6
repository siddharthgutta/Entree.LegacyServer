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
}
