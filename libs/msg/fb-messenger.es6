/**
 * Created by kfu on 4/13/16.
 */

import MsgPlatform from '../msg.es6';
import {Router} from 'express';
import bodyParser from 'body-parser';
import request from 'request';
import Promise from 'bluebird';

/**
 * Notification types for sending messages
 * Explanation:
 * REGULAR will emit a sound/vibration and a phone notification
 * SILENT_PUSH will just emit a phone notification
 * NO_PUSH will not emit either
 *
 * @type {{REGULAR: string, SILENT_PUSH: string, NO_PUSH: string}}
 */
export const NotificationType = {
  REGULAR: 'REGULAR',
  SILENT_PUSH: 'SILENT_PUSH',
  NO_PUSH: 'NO_PUSH'
};

export default class FBMessenger extends MsgPlatform {
  /**
   * FB Messenger constructor with the page specific access token
   *
   * @param {String} pageAccessToken: access token for specific page
   * @param {String} verificationToken: verification token for specific page webhook
   * @param {String} pageId: id of the page for the fb bot
   * @param {Boolean} productionOrSandbox: production or sandbox mode
   * @returns {FBMessenger} FBMessenger object
   */
  constructor(pageAccessToken, verificationToken, pageId, productionOrSandbox) {
    super();
    console.tag('libs', 'msg', 'fb-messenger').log(`Initialized FB Messenger`);
    this.pageAccessToken = pageAccessToken;
    this.verificationToken = verificationToken;
    this.pageId = pageId;
    this.productionOrSandbox = productionOrSandbox;
  }

  /**
   * Sets the welcome message
   * Note: To delete the welcome message, pass in no parameter
   *
   * @param {Object} messageData: REQUIRED message data, contents of the message
   * @return {Promise} Promise result with response or error
   */
  setWelcomeMessage(messageData = null) {
    return new Promise((resolve, reject) => {
      request({
        url: `https://graph.facebook.com/v2.6/${this.pageId}/thread_settings`,
        qs: {access_token: this.pageAccessToken},
        method: 'POST',
        json: {
          setting_type: 'call_to_actions',
          thread_state: 'new_thread',
          call_to_actions: [
            {
              message: messageData
            }
          ]
        }
      }, (error, response, body) => {
        if (error) {
          console.tag('libs', 'msg', 'fb-messenger', 'welcome').log('Error sending message: ', error);
          reject(error);
        } else if (response.body.error) {
          console.tag('libs', 'msg', 'fb-messenger', 'welcome').log('Error: ', response.body.error);
          reject(response.body.error);
        } else {
          console.tag('libs', 'msg', 'fb-messenger', 'welcome').log(`Response Body:`, body);
          resolve(body);
        }
      });
    });
  }

  /**
   * Gets Facebook Profile Info
   *
   * @param {String} userId: facebook user id
   * @return {Object} Facebook user information
   */
  getFacebookProfileInfo(userId) {
    return new Promise((resolve, reject) => {
      request({
        url: `https://graph.facebook.com/v2.6/${userId}`,
        qs: {
          fields: 'first_name,last_name,profile_pic',
          access_token: this.pageAccessToken
        },
        method: 'GET',
        json: true
      }, (error, response, body) => {
        if (error) {
          console.tag('libs', 'msg', 'fb-messenger').log('Error retrieving facebook profile info: ', error);
          reject(error);
        } else if (response.body.error) {
          console.tag('libs', 'msg', 'fb-messenger').log('Error: ', response.body.error);
          reject(response.body.error);
        } else {
          console.tag('libs', 'msg', 'fb-messenger').log(`Profile Info Body:`, body);
          resolve(body);
        }
      });
    });
  }

  /**
   * Sending a message to a specific Facebook phone number
   *
   * @param {String} recipientPhoneNumber: REQUIRED phone number of fb user - Format: +1(212)555-2368
   * @param {Object} messageData: REQUIRED message data, contents of the message
   * @param {String} notificationType: OPTIONAL notification type
   * @return {Null} unused return statement
   */
  async sendMessageToPhoneNumber(recipientPhoneNumber, messageData, notificationType = NotificationType.SILENT_PUSH) {
    await this._sendMessage({phone_number: recipientPhoneNumber}, messageData, notificationType);
  }

  /**
   * Sending a message to a specific Facebook recipient id
   *
   * @param {String} recipientId: REQUIRED fb id of recipient
   * @param {Object} messageData: REQUIRED message data, contents of the message
   * @param {String} notificationType: OPTIONAL notification type
   * @return {Null} unused return statement
   */
  async sendMessageToId(recipientId, messageData, notificationType = NotificationType.SILENT_PUSH) {
    await this._sendMessage({id: recipientId}, messageData, notificationType);
  }

  /**
   * Sending a messsage to a specific Facebook recipient
   *
   * @param {Object} recipient: REQUIRED phone number or id of fb user - Phone# Format: +1(212)555-2368
   * @param {Object} messageData: REQUIRED message data, contents of the message
   * @param {String} notificationType: OPTIONAL notification type
   * @private
   * @return {Promise} Promise result with response or error
   */
  _sendMessage(recipient, messageData, notificationType = NotificationType.SILENT_PUSH) {
    console.tag('libs', 'msg', 'fb-messenger', 'MESSAGE_SEND').log(`Sending message to ${recipient.toString()}`,
      messageData);

    return new Promise((resolve, reject) => {
      request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: this.pageAccessToken},
        method: 'POST',
        json: {
          recipient,
          message: messageData,
          notification_type: notificationType
        }
      }, (error, response, body) => {
        if (error) {
          console.tag('libs', 'msg', 'fb-messenger').log('Error sending message: ', error);
          reject(error);
        } else if (response.body.error) {
          console.tag('libs', 'msg', 'fb-messenger').log('Error: ', response.body.error);
          reject(response.body.error);
        } else {
          console.tag('libs', 'msg', 'fb-messenger').log(`Response Body:`, body);
          console.tag('libs', 'msg', 'fb-messenger').log(`Recipient Id:`, body.recipient_id);
          console.tag('libs', 'msg', 'fb-messenger').log(`Message Id:`, body.message_id);
          resolve(body);
        }
      });
    });
  }

  /**
   * Sets up webhook routers for accepint notifications from Facebook
   *
   * @returns {Router} Router object
   */
  router() {
    const route = new Router();
    route.use(bodyParser.urlencoded({extended: true}));

    /**
     * Verification for setting up initial webhook
     */
    route.get('/webhook', (req, res) => {
      console.tag('libs', 'msg', 'fb-messenger').log(`Received GET Verification Request:`, req.query);
      if (req.query['hub.verify_token'] === this.verificationToken) {
        console.tag('libs', 'msg', 'fb-messenger').log('Verification: SUCCEEDED');
        res.send(req.query['hub.challenge']);
        return;
      }
      console.tag('libs', 'msg', 'fb-messenger').log('Verification: FAILED');
      res.send('Error, wrong validation token');
    });

    /**
     * Webhook for accepting incoming messages/postbacks
     */
    route.post('/webhook', async (req, res) => {
      const entries = req.body.entry;
      console.tag('libs', 'msg', 'fb-messenger', 'WEBHOOK RECEIVED').log(req.body.entry);
      // Loop through each of the entries
      for (let i = 0; i < entries.length; i++) {
        const messagingEvents = entries[i].messaging;
        // Loop through each of the messaging events
        for (let j = 0; j < messagingEvents.length; j++) {
          this._handleEvent(messagingEvents[j]);
        }
      }
      res.sendStatus(200);
    });

    return route;
  }
}
