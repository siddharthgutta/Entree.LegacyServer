/**
 * Created by kfu on 4/13/16.
 */

import MsgPlatform from '../msg.es6';
import {Router} from 'express';
import bodyParser from 'body-parser';
import config from 'config';
import request from 'request';
import {GenericMessageData, TextMessageData, ButtonMessageData, ReceiptMessageData} from './facebook/message-data.es6';

export default class FBMessenger extends MsgPlatform {
  constructor(pageAccessToken) {
    super();
    this.pageAccessToken = pageAccessToken;
  }

  getFacebookProfileInfo(userId) {
    request({
      url: `https://graph.facebook.com/v2.6/${userId}`,
      qs: {
        fields: 'first_name,last_name,profile_pic',
        access_token: this.pageAccessToken
      },
      method: 'GET'
    }, (error, response, body) => {
      if (error) {
        console.log('Error retrieving facebook profile info: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
      console.log(`Profile Info Response:`, response.body);
      console.log(`Profile Info Body:`, body);
    });
  }

  sendMessage(recipientId, messageData) {
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: this.pageAccessToken},
      method: 'POST',
      json: {
        recipient: {id: recipientId},
        message: messageData
      }
    }, (error, response, body) => {
      if (error) {
        console.log('Error sending message: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
      console.log(`Response:`, response.body);
      console.log(`Body:`, body);
    });
  }

  sendTextMessage(recipientId, text) {
    this.sendMessage(recipientId, (new TextMessageData(text)).toJSON());
  }

  router() {
    const route = new Router();
    route.use(bodyParser.urlencoded({extended: true}));

    /**
     * Verification for setting up initial webhook
     */
    route.get('/webhook', (req, res) => {
      if (req.query['hub.verify_token'] === config.get('Facebook.verify_token')) {
        res.send(req.query['hub.challenge']);
        return;
      }
      res.send('Error, wrong validation token');
    });

    route.post('/webhook', (req, res) => {
      const messagingEvents = req.body.entry[0].messaging;
      for (let i = 0; i < messagingEvents.length; i++) {
        const event = req.body.entry[0].messaging[i];
        const sender = event.sender.id;
        if (event.postback) {
          // Postbacks are end calls to your webhook when buttons are tapped
          console.log(event);
          const postbackText = JSON.stringify(event.postback);
          this.sendTextMessage(sender, `Postback received: ${postbackText.substring(0, 200)}`);
          continue;
        } else if (event.message && event.message.text) {
          const text = event.message.text;
          // Handle a text message from this sender
          console.tag('libs', 'msg', 'fb-messenger').log(`${sender}: ${text}`);
          if (text === 'Generic') {
            const msgData = new GenericMessageData();
            msgData.pushElement('First card', 'Element #1 of an hscroll',
              'http://messengerdemo.parseapp.com/img/rift.png');
            msgData.pushLinkButton('Entree Website', 'https://textentree.com/');
            msgData.pushPostbackButton('Postback', 'Payload for first element in a generic bubble');
            msgData.pushElement('Second card', 'Element #2 of an hscroll',
              'http://messengerdemo.parseapp.com/img/rift.png');
            msgData.pushPostbackButton('Postback', 'Payload for second element in a generic bubble');
            this.sendMessage(sender, msgData.toJSON());
            continue;
          } else if (text === 'Button') {
            const msgData = new ButtonMessageData('What do you want to do next?');
            msgData.pushLinkButton('Show Website', 'https://petersapparel.parseapp.com');
            msgData.pushPostbackButton('Start Chatting', 'USER_DEFINED_PAYLOAD');
            this.sendMessage(sender, msgData.toJSON());
            continue;
          } else if (text === 'Receipt') {
            const msgData = new ReceiptMessageData('Stephane Crozatier', '12345678902', 'USD', 'Visa 2345',
              'http://petersapparel.parseapp.com/order?order_id=123456', '1428444852');
            msgData.addElement('Classic White T-Shirt', '100% Soft and Luxurious Cotton', 2, 50, 'USD',
              'http://petersapparel.parseapp.com/img/whiteshirt.png');
            msgData.addElement('Classic Gray T-Shirt', '100% Soft and Luxurious Cotton', 1, 25, 'USD',
              'http://petersapparel.parseapp.com/img/grayshirt.png');
            msgData.addSummary(56.14, 75.00, 6.19, 4.95);
            msgData.addShippingAddress('1 Hacker Way', 'Menlo Park', '94025', 'CA', 'US', '');
            msgData.addAdjustment('New Customer Discount', 20);
            msgData.addAdjustment('$10 Off Coupon', 10);
            this.sendMessage(sender, msgData.toJSON());
            continue;
          }
          this.sendTextMessage(sender, `Text received, echo: ${text.substring(0, 200)}`);
        } else if (event.message && event.message.attachments) {
          const attachments = event.message.attachments;
          for (let j = 0; j < attachments.length; j++) {
            const curAttachment = attachments[j];
            if (curAttachment.type === 'location') {
              const responseMsg = `I know where you live :P\nLat: ${curAttachment.payload.coordinates.lat}\nLong: ` +
                `${curAttachment.payload.coordinates.long}`;
              console.log(responseMsg);
              this.sendTextMessage(sender, responseMsg);
            }
          }
          continue;
        } else {
          console.log(event);
        }
      }
      res.sendStatus(200);
    });

    return route;
  }
}
