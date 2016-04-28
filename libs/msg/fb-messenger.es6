/**
 * Created by kfu on 4/13/16.
 */

import MsgPlatform from '../msg.es6';
import {Router} from 'express';
import bodyParser from 'body-parser';
import request from 'request';
import {ImageMessageData, GenericMessageData, TextMessageData,
  ButtonMessageData, ReceiptMessageData} from './facebook/message-data.es6';
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
   * @param {Boolean} productionOrSandbox: production or sandbox mode
   * @returns {FBMessenger} FBMessenger object
   */
  constructor(pageAccessToken, verificationToken, productionOrSandbox) {
    super();
    console.tag('libs', 'msg', 'fb-messenger').log(`Setting up FB Messenger with page_access_token|` +
      `verification_token:${pageAccessToken}|${verificationToken}`);
    this.pageAccessToken = pageAccessToken;
    this.verificationToken = verificationToken;
    this.productionOrSandbox = productionOrSandbox;
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
   * @return {Null} unused return statement
   */
  _sendMessage(recipient, messageData, notificationType = NotificationType.SILENT_PUSH) {
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
      console.tag('libs', 'msg', 'fb-messenger').log(req.body);
      const entries = req.body.entry;
      // Loop through each of the entries
      for (let i = 0; i < entries.length; i++) {
        const messagingEvents = entries[i].messaging;
        // Loop through each of the messaging events
        for (let j = 0; j < messagingEvents.length; j++) {
          const event = messagingEvents[j];
          this._handleEvent(event);
          const sender = event.sender.id;
          if (event.postback) {
            // Postbacks are end calls to your webhook when buttons are tapped
            console.tag('libs', 'msg', 'fb-messenger').log(event);
            const postbackText = JSON.stringify(event.postback);
            const msgData = new TextMessageData(`Postback received: ${postbackText.substring(0, 200)}`);
            await this.sendMessageToId(sender, msgData.toJSON());
          } else if (event.message && event.message.text) {
            const text = event.message.text;
            // Handle a text message from this sender
            console.tag('libs', 'msg', 'fb-messenger').log(`${sender}: ${text}`);
            if (text === 'Profile') {
              try {
                const profileInfo = await this.getFacebookProfileInfo(sender);
                let responseMsg = `First Name: `;
                responseMsg += profileInfo.first_name; // eslint-disable-line no-use-before-define
                responseMsg += `\nLast Name: `;
                responseMsg += profileInfo.last_name; // eslint-disable-line no-use-before-define
                const msgData = new TextMessageData(responseMsg);
                await this.sendMessageToId(sender, msgData.toJSON());
                const imageMsgData = new ImageMessageData(profileInfo.profile_pic);
                await this.sendMessageToId(sender, imageMsgData.toJSON());
              } catch (err) {
                console.tag('libs', 'msg', 'fb-messenger').log(err);
                const msgData = new TextMessageData(`Failed ${JSON.stringify(err)}`);
                await this.sendMessageToId(sender, msgData.toJSON());
              }
            } else if (text === 'Image') {
              const msgData = new ImageMessageData(`http://www.reactionface.info/sites/default/files/imagecache/` +
                `Node_Page/images/1287666826226.png`);
              await this.sendMessageToId(sender, msgData.toJSON());
            } else if (text === 'Generic') {
              const msgData = new GenericMessageData();
              msgData.pushElement('First card', 'Element #1 of an hscroll',
                'http://secretmenus.com/wp-content/uploads/2014/03/chick-fil-a-secret-menu-meal.jpg');
              msgData.pushLinkButton('Entree Website', 'https://textentree.com/');
              msgData.pushPostbackButton('Postback', 'Payload for first element in a generic bubble');
              msgData.pushElement('Second card', 'Element #2 of an hscroll',
                'https://s-media-cache-ak0.pinimg.com/236x/db/cb/50/dbcb5076badf2d5ef141178d15fdc04b.jpg');
              msgData.pushLinkButton('Entree Website', 'https://textentree.com/');
              msgData.pushPostbackButton('Postback', 'Payload for second element in a generic bubble');
              await this.sendMessageToId(sender, msgData.toJSON());
            } else if (text === 'Button') {
              const msgData = new ButtonMessageData('What do you want to do next?');
              msgData.pushLinkButton('Show Website', 'https://petersapparel.parseapp.com');
              msgData.pushPostbackButton('Start Chatting', 'USER_DEFINED_PAYLOAD');
              await this.sendMessageToId(sender, msgData.toJSON());
            } else if (text === 'Receipt') {
              if (this.productionOrSandbox) {
                const msgData = new TextMessageData(`Receipts are being blocked on production right now. ` +
                  `Using receipts wastes order ids that cannot be reused.`);
                await this.sendMessageToId(sender, msgData.toJSON());
              } else {
                try {
                  const msgData = new ReceiptMessageData('Stephane Crozatier', '12345678902', 'USD', 'Visa 2345',
                    'http://petersapparel.parseapp.com/order?order_id=123456', '1428444852');
                  msgData.pushElement('Classic White T-Shirt', 2, 50, 'USD',
                    'http://petersapparel.parseapp.com/img/whiteshirt.png', '100% Soft and Luxurious Cotton');
                  msgData.pushElement('Classic Gray T-Shirt', 1, 25, 'USD',
                    'http://petersapparel.parseapp.com/img/grayshirt.png', '100% Soft and Luxurious Cotton');
                  msgData.addSummary(56.14, 75.00, 6.19, 4.95);
                  msgData.addShippingAddress('1 Hacker Way', 'Menlo Park', '94025', 'CA', 'US');
                  msgData.pushAdjustment('New Customer Discount', 20);
                  msgData.pushAdjustment('$10 Off Coupon', 10);
                  await this.sendMessageToId(sender, msgData.toJSON());
                } catch (err) {
                  const msgData = new TextMessageData(`Receipts are broken right now because IDs are not unique. ` +
                    `We will fix this later.`);
                  await this.sendMessageToId(sender, msgData.toJSON());
                }
              }
            } else {
              const msgData = new TextMessageData(`Text received, echo: ${text.substring(0, 200)}`);
              await this.sendMessageToId(sender, msgData.toJSON());
            }
          } else if (event.message && event.message.attachments) {
            const attachments = event.message.attachments;
            for (let k = 0; k < attachments.length; k++) {
              const curAttachment = attachments[k];
              if (curAttachment.type === 'location') {
                const responseMsg = `I know where you live :P\nLat: ${curAttachment.payload.coordinates.lat}\nLong: ` +
                  `${curAttachment.payload.coordinates.long}`;
                const msgData = new TextMessageData(responseMsg);
                await this.sendMessageToId(sender, msgData.toJSON());
              }
            }
          } else {
            console.tag('libs', 'msg', 'fb-messenger').log(event);
          }
        }
      }
      res.sendStatus(200);
    });

    return route;
  }
}
