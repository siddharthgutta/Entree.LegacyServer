/**
 * Created by kfu on 3/10/16.
 */

export default class NotifierStrategy {
  constructor() {
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
