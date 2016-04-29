/**
 * Created by kfu on 4/27/16.
 */

import assert from 'assert';
import {ImageMessageData, GenericMessageData, TextMessageData,
  ButtonMessageData, ReceiptMessageData} from '../libs/msg/facebook/message-data.es6';

describe('FB Message Data', () => {
  const title1 = 'Title1';
  const payload1 = 'Payload1';
  const url1 = 'https://www.url1.com';

  const title2 = 'Title2';
  const payload2 = 'Payload2';
  const url2 = 'https://www.url2.com';

  describe('#ImageMessageData', () => {
    it('should create an image message correctly', () => {
      const url = `http://www.reactionface.info/sites/default/files/imagecache/` +
        `Node_Page/images/1287666826226.png`;
      const msgData = new ImageMessageData(url);
      const msgDataJSON = msgData.toJSON();
      assert.deepEqual(msgDataJSON.attachment.type, 'image');
      assert.deepEqual(msgDataJSON.attachment.payload.url, url);
    });
  });

  describe('#GenericMessageData', () => {
    it('should create the correct generic message structure correctly', () => {
      const msgData = new GenericMessageData();
      const msgDataJSON = msgData.toJSON();
      assert.deepEqual(msgDataJSON.attachment.type, 'template');
      assert.deepEqual(msgDataJSON.attachment.payload.template_type, 'generic');
      assert.deepEqual(msgDataJSON.attachment.payload.elements, []);
    });

    describe('pushElement', () => {
      const elementTitle1 = 'First card';
      const subtitle1 = 'Element #1 of an hscroll';
      const imageUrl1 = 'http://secretmenus.com/wp-content/uploads/2014/03/chick-fil-a-secret-menu-meal.jpg';
      const itemUrl1 = 'http://www.itemUrl1.com';

      const elementTitle2 = 'Second card';
      const subtitle2 = 'Element #2 of an hscroll';
      const imageUrl2 = 'https://s-media-cache-ak0.pinimg.com/236x/db/cb/50/dbcb5076badf2d5ef141178d15fdc04b.jpg';
      const itemUrl2 = 'http://www.itemUrl2.com';

      it('should add an element without optional params successfully', () => {
        const msgData = new GenericMessageData();
        msgData.pushElement(elementTitle1);
        const msgDataElements = msgData.toJSON().attachment.payload.elements;
        assert.equal(msgDataElements.length, 1);
        assert.deepEqual(msgDataElements[0].title, elementTitle1);
        assert.deepEqual(msgDataElements[0].subtitle, undefined);
        assert.deepEqual(msgDataElements[0].image_url, undefined);
        assert.deepEqual(msgDataElements[0].item_url, undefined);
        assert.deepEqual(msgDataElements[0].buttons, []);
      });

      it('should add an element with optional params successfully', () => {
        const msgData = new GenericMessageData();
        msgData.pushElement(elementTitle1, subtitle1, imageUrl1, itemUrl1);
        const msgDataElements = msgData.toJSON().attachment.payload.elements;
        assert.equal(msgDataElements.length, 1);
        assert.deepEqual(msgDataElements[0].title, elementTitle1);
        assert.deepEqual(msgDataElements[0].subtitle, subtitle1);
        assert.deepEqual(msgDataElements[0].image_url, imageUrl1);
        assert.deepEqual(msgDataElements[0].item_url, itemUrl1);
        assert.deepEqual(msgDataElements[0].buttons, []);
      });

      it('should add multiple elements successfully', () => {
        const thirdElementTitle = 'Third Element Title';
        const msgData = new GenericMessageData();
        msgData.pushElement(elementTitle1, subtitle1, imageUrl1, itemUrl1);
        msgData.pushElement(thirdElementTitle);
        msgData.pushElement(elementTitle2, subtitle2, imageUrl2, itemUrl2);
        const msgDataElements = msgData.toJSON().attachment.payload.elements;
        assert.equal(msgDataElements.length, 3);

        assert.deepEqual(msgDataElements[0].title, elementTitle1);
        assert.deepEqual(msgDataElements[0].subtitle, subtitle1);
        assert.deepEqual(msgDataElements[0].image_url, imageUrl1);
        assert.deepEqual(msgDataElements[0].item_url, itemUrl1);
        assert.deepEqual(msgDataElements[0].buttons, []);

        assert.deepEqual(msgDataElements[1].title, thirdElementTitle);
        assert.deepEqual(msgDataElements[1].subtitle, undefined);
        assert.deepEqual(msgDataElements[1].image_url, undefined);
        assert.deepEqual(msgDataElements[1].item_url, undefined);
        assert.deepEqual(msgDataElements[1].buttons, []);

        assert.deepEqual(msgDataElements[2].title, elementTitle2);
        assert.deepEqual(msgDataElements[2].subtitle, subtitle2);
        assert.deepEqual(msgDataElements[2].image_url, imageUrl2);
        assert.deepEqual(msgDataElements[2].item_url, itemUrl2);
        assert.deepEqual(msgDataElements[2].buttons, []);
      });
    });

    describe('pushPostbackButton', () => {
      const elementTitle1 = 'First card';
      const elementTitle2 = 'Second card';

      it('should push a single postback button successfully to a single element', () => {
        const msgData = new GenericMessageData();
        msgData.pushElement(elementTitle1);
        msgData.pushPostbackButton(title1, payload1);
        const msgDataElements = msgData.toJSON().attachment.payload.elements;
        assert.equal(msgDataElements.length, 1);
        assert.deepEqual(msgDataElements[0].title, elementTitle1);

        const msgDataButtons = msgDataElements[0].buttons;
        assert.equal(msgDataButtons.length, 1);
        assert.deepEqual(msgDataButtons[0].type, 'postback');
        assert.deepEqual(msgDataButtons[0].title, title1);
        assert.deepEqual(msgDataButtons[0].payload, payload1);
      });

      it('should push a multiple postback buttons successfully to a multiple elements', () => {
        const msgData = new GenericMessageData();
        msgData.pushElement(elementTitle1);
        msgData.pushPostbackButton(title1, payload1);
        msgData.pushPostbackButton(title2, payload2);

        msgData.pushElement(elementTitle2);
        msgData.pushPostbackButton(title1, payload1);
        msgData.pushPostbackButton(title2, payload2);

        const msgDataElements = msgData.toJSON().attachment.payload.elements;
        assert.equal(msgDataElements.length, 2);

        assert.deepEqual(msgDataElements[0].title, elementTitle1);
        assert.deepEqual(msgDataElements[1].title, elementTitle2);

        const msgDataButtons1 = msgDataElements[0].buttons;

        assert.deepEqual(msgDataButtons1[0].type, 'postback');
        assert.deepEqual(msgDataButtons1[0].title, title1);
        assert.deepEqual(msgDataButtons1[0].payload, payload1);

        assert.deepEqual(msgDataButtons1[1].type, 'postback');
        assert.deepEqual(msgDataButtons1[1].title, title2);
        assert.deepEqual(msgDataButtons1[1].payload, payload2);

        const msgDataButtons2 = msgDataElements[1].buttons;

        assert.deepEqual(msgDataButtons2[0].type, 'postback');
        assert.deepEqual(msgDataButtons2[0].title, title1);
        assert.deepEqual(msgDataButtons2[0].payload, payload1);

        assert.deepEqual(msgDataButtons2[1].type, 'postback');
        assert.deepEqual(msgDataButtons2[1].title, title2);
        assert.deepEqual(msgDataButtons2[1].payload, payload2);
      });
    });

    describe('pushLinkButton', () => {
      const elementTitle1 = 'First card';
      const elementTitle2 = 'Second card';

      it('should push a single link button successfully to a single element', () => {
        const msgData = new GenericMessageData();
        msgData.pushElement(elementTitle1);
        msgData.pushLinkButton(title1, url1);
        const msgDataElements = msgData.toJSON().attachment.payload.elements;
        assert.equal(msgDataElements.length, 1);
        assert.deepEqual(msgDataElements[0].title, elementTitle1);

        const msgDataButtons = msgDataElements[0].buttons;
        assert.equal(msgDataButtons.length, 1);
        assert.deepEqual(msgDataButtons[0].type, 'web_url');
        assert.deepEqual(msgDataButtons[0].title, title1);
        assert.deepEqual(msgDataButtons[0].url, url1);
      });

      it('should push a multiple link buttons successfully to a multiple elements', () => {
        const msgData = new GenericMessageData();
        msgData.pushElement(elementTitle1);
        msgData.pushLinkButton(title1, url1);
        msgData.pushLinkButton(title2, url2);

        msgData.pushElement(elementTitle2);
        msgData.pushLinkButton(title1, url1);
        msgData.pushLinkButton(title2, url2);

        const msgDataElements = msgData.toJSON().attachment.payload.elements;
        assert.equal(msgDataElements.length, 2);

        assert.deepEqual(msgDataElements[0].title, elementTitle1);
        assert.deepEqual(msgDataElements[1].title, elementTitle2);

        const msgDataButtons1 = msgDataElements[0].buttons;

        assert.deepEqual(msgDataButtons1[0].type, 'web_url');
        assert.deepEqual(msgDataButtons1[0].title, title1);
        assert.deepEqual(msgDataButtons1[0].url, url1);

        assert.deepEqual(msgDataButtons1[1].type, 'web_url');
        assert.deepEqual(msgDataButtons1[1].title, title2);
        assert.deepEqual(msgDataButtons1[1].url, url2);

        const msgDataButtons2 = msgDataElements[1].buttons;

        assert.deepEqual(msgDataButtons2[0].type, 'web_url');
        assert.deepEqual(msgDataButtons2[0].title, title1);
        assert.deepEqual(msgDataButtons2[0].url, url1);

        assert.deepEqual(msgDataButtons2[1].type, 'web_url');
        assert.deepEqual(msgDataButtons2[1].title, title2);
        assert.deepEqual(msgDataButtons2[1].url, url2);
      });
    });

    it('should push a multiple link or postback buttons successfully to a multiple elements', () => {
      const elementTitle1 = 'First card';
      const elementTitle2 = 'Second card';

      const msgData = new GenericMessageData();
      msgData.pushElement(elementTitle1);
      msgData.pushPostbackButton(title1, payload1);
      msgData.pushLinkButton(title2, url2);

      msgData.pushElement(elementTitle2);
      msgData.pushLinkButton(title1, url1);
      msgData.pushPostbackButton(title2, payload2);

      const msgDataElements = msgData.toJSON().attachment.payload.elements;
      assert.equal(msgDataElements.length, 2);

      const msgDataButtons1 = msgDataElements[0].buttons;

      assert.deepEqual(msgDataButtons1[0].type, 'postback');
      assert.deepEqual(msgDataButtons1[0].title, title1);
      assert.deepEqual(msgDataButtons1[0].payload, payload1);

      assert.deepEqual(msgDataButtons1[1].type, 'web_url');
      assert.deepEqual(msgDataButtons1[1].title, title2);
      assert.deepEqual(msgDataButtons1[1].url, url2);

      const msgDataButtons2 = msgDataElements[1].buttons;

      assert.deepEqual(msgDataButtons2[0].type, 'web_url');
      assert.deepEqual(msgDataButtons2[0].title, title1);
      assert.deepEqual(msgDataButtons2[0].url, url1);

      assert.deepEqual(msgDataButtons2[1].type, 'postback');
      assert.deepEqual(msgDataButtons2[1].title, title2);
      assert.deepEqual(msgDataButtons2[1].payload, payload2);
    });
  });

  describe('#TextMessageData', () => {
    it('should create standard text message correctly', () => {
      const text = 'Yolo';
      const msgData = new TextMessageData(text);
      assert.deepEqual(msgData.toJSON(), {text});
    });
  });

  describe('#ButtonMessageData', () => {
    const text = 'Button Message Data Text';

    it('should create the correct button message structure correctly', () => {
      const msgData = new ButtonMessageData(text);
      const msgDataJSON = msgData.toJSON();
      assert.deepEqual(msgDataJSON.attachment.type, 'template');
      assert.deepEqual(msgDataJSON.attachment.payload.template_type, 'button');
      assert.deepEqual(msgDataJSON.attachment.payload.text, text);
      assert.deepEqual(msgDataJSON.attachment.payload.buttons, []);
    });

    describe('pushPostbackButton', () => {
      it('should add a postback button correctly', () => {
        const msgData = new ButtonMessageData(text);
        msgData.pushPostbackButton(title1, payload1);
        const msgDataButtons = msgData.toJSON().attachment.payload.buttons;
        assert.equal(msgDataButtons.length, 1);
        assert.deepEqual(msgDataButtons[0].type, 'postback');
        assert.deepEqual(msgDataButtons[0].title, title1);
        assert.deepEqual(msgDataButtons[0].payload, payload1);
      });

      it('should add multiple postback buttons correctly', () => {
        const msgData = new ButtonMessageData(text);
        msgData.pushPostbackButton(title1, payload1);
        let msgDataButtons = msgData.toJSON().attachment.payload.buttons;
        assert.equal(msgDataButtons.length, 1);

        msgData.pushPostbackButton(title2, payload2);
        msgDataButtons = msgData.toJSON().attachment.payload.buttons;
        assert.equal(msgDataButtons.length, 2);

        const firstButton = msgDataButtons[0];
        assert.deepEqual(firstButton.type, 'postback');
        assert.deepEqual(firstButton.title, title1);
        assert.deepEqual(firstButton.payload, payload1);

        const secondButton = msgDataButtons[1];
        assert.deepEqual(secondButton.type, 'postback');
        assert.deepEqual(secondButton.title, title2);
        assert.deepEqual(secondButton.payload, payload2);
      });
    });

    describe('pushLinkButton', () => {
      it('should add a link button correctly', () => {
        const msgData = new ButtonMessageData(text);
        msgData.pushLinkButton(title1, url1);
        const msgDataButtons = msgData.toJSON().attachment.payload.buttons;
        assert.equal(msgDataButtons.length, 1);
        assert.deepEqual(msgDataButtons[0].type, 'web_url');
        assert.deepEqual(msgDataButtons[0].title, title1);
        assert.deepEqual(msgDataButtons[0].url, url1);
      });

      it('should add multiple link buttons correctly', () => {
        const msgData = new ButtonMessageData(text);
        msgData.pushLinkButton(title1, url1);
        let msgDataButtons = msgData.toJSON().attachment.payload.buttons;
        assert.equal(msgDataButtons.length, 1);

        msgData.pushLinkButton(title2, url2);
        msgDataButtons = msgData.toJSON().attachment.payload.buttons;
        assert.equal(msgDataButtons.length, 2);

        const firstButton = msgDataButtons[0];
        assert.deepEqual(firstButton.type, 'web_url');
        assert.deepEqual(firstButton.title, title1);
        assert.deepEqual(firstButton.url, url1);

        const secondButton = msgDataButtons[1];
        assert.deepEqual(secondButton.type, 'web_url');
        assert.deepEqual(secondButton.title, title2);
        assert.deepEqual(secondButton.url, url2);
      });
    });

    it('should add buttons of different types in the correct order', () => {
      const msgData = new ButtonMessageData(text);
      msgData.pushPostbackButton(title1, payload1);
      let msgDataButtons = msgData.toJSON().attachment.payload.buttons;
      assert.equal(msgDataButtons.length, 1);

      msgData.pushLinkButton(title2, url2);
      msgDataButtons = msgData.toJSON().attachment.payload.buttons;
      assert.equal(msgDataButtons.length, 2);

      const firstButton = msgDataButtons[0];
      assert.deepEqual(firstButton.type, 'postback');
      assert.deepEqual(firstButton.title, title1);
      assert.deepEqual(firstButton.payload, payload1);

      const secondButton = msgDataButtons[1];
      assert.deepEqual(secondButton.type, 'web_url');
      assert.deepEqual(secondButton.title, title2);
      assert.deepEqual(secondButton.url, url2);
    });
  });

  describe('#ReceiptMessageData', () => {
    const recipientName = 'Stephane Crozatier';
    const orderNumber = '12345678902';
    const currency = 'USD';
    const paymentMethod = 'Visa 2345';
    const orderUrl = 'http://petersapparel.parseapp.com/order?order_id=123456';
    const timestamp = '1428444852';

    describe('constructor', () => {
      it('should create the receipt message structure without optional params correctly', () => {
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod);
        const msgDataJSON = msgData.toJSON();
        assert.deepEqual(msgDataJSON.attachment.type, 'template');
        assert.deepEqual(msgDataJSON.attachment.payload.template_type, 'receipt');
        assert.deepEqual(msgDataJSON.attachment.payload.recipient_name, recipientName);
        assert.deepEqual(msgDataJSON.attachment.payload.order_number, orderNumber);
        assert.deepEqual(msgDataJSON.attachment.payload.currency, currency);
        assert.deepEqual(msgDataJSON.attachment.payload.payment_method, paymentMethod);
        assert.deepEqual(msgDataJSON.attachment.payload.order_url, undefined);
        assert.deepEqual(msgDataJSON.attachment.payload.timestamp, undefined);
        assert.deepEqual(msgDataJSON.attachment.payload.elements, []);
        assert.deepEqual(msgDataJSON.attachment.payload.adjustments, []);
      });

      it('should create the receipt message structure with optional params correctly', () => {
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod,
          orderUrl, timestamp);
        const msgDataJSON = msgData.toJSON();
        assert.deepEqual(msgDataJSON.attachment.type, 'template');
        assert.deepEqual(msgDataJSON.attachment.payload.template_type, 'receipt');
        assert.deepEqual(msgDataJSON.attachment.payload.recipient_name, recipientName);
        assert.deepEqual(msgDataJSON.attachment.payload.order_number, orderNumber);
        assert.deepEqual(msgDataJSON.attachment.payload.currency, currency);
        assert.deepEqual(msgDataJSON.attachment.payload.payment_method, paymentMethod);
        assert.deepEqual(msgDataJSON.attachment.payload.order_url, orderUrl);
        assert.deepEqual(msgDataJSON.attachment.payload.timestamp, timestamp);
        assert.deepEqual(msgDataJSON.attachment.payload.elements, []);
        assert.deepEqual(msgDataJSON.attachment.payload.adjustments, []);
      });
    });

    describe('pushElement', () => {
      const elementTitle1 = 'Classic White T-Shirt';
      const quantity1 = 2;
      const price1 = 50;
      const currency1 = 'USD';
      const elemUrl1 = 'http://petersapparel.parseapp.com/img/whiteshirt.png';
      const subtitle1 = '100% Soft and Luxurious Cotton';

      const elementTitle2 = 'Classic White T-Shirt';
      const quantity2 = 1;
      const price2 = 25;
      const currency2 = 'USD';
      const elemUrl2 = 'http://petersapparel.parseapp.com/img/grayshirt.png';
      const subtitle2 = '200% Soft and Luxurious Cotton';

      it('should create an element without optional params correctly', () => {
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod);
        msgData.pushElement(elementTitle1);
        const msgDataElements = msgData.toJSON().attachment.payload.elements;
        assert.equal(msgDataElements.length, 1);
        assert.deepEqual(msgDataElements[0].title, elementTitle1);
        assert.deepEqual(msgDataElements[0].quantity, undefined);
        assert.deepEqual(msgDataElements[0].price, undefined);
        assert.deepEqual(msgDataElements[0].currency, undefined);
        assert.deepEqual(msgDataElements[0].image_url, undefined);
        assert.deepEqual(msgDataElements[0].subtitle, undefined);
      });

      it('should create element with optional params correctly', () => {
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod);
        msgData.pushElement(elementTitle1, quantity1, price1, currency1, elemUrl1, subtitle1);
        const msgDataElements = msgData.toJSON().attachment.payload.elements;
        assert.equal(msgDataElements.length, 1);
        assert.deepEqual(msgDataElements[0].title, elementTitle1);
        assert.deepEqual(msgDataElements[0].quantity, quantity1);
        assert.deepEqual(msgDataElements[0].price, price1);
        assert.deepEqual(msgDataElements[0].currency, currency1);
        assert.deepEqual(msgDataElements[0].image_url, elemUrl1);
        assert.deepEqual(msgDataElements[0].subtitle, subtitle1);
      });

      it('should create multiple elements with optional params correctly', () => {
        const thirdTitle = 'Yolo';
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod);
        msgData.pushElement(elementTitle1, quantity1, price1, currency1, elemUrl1, subtitle1);
        msgData.pushElement(thirdTitle);
        msgData.pushElement(elementTitle2, quantity2, price2, currency2, elemUrl2, subtitle2);
        const msgDataElements = msgData.toJSON().attachment.payload.elements;
        assert.equal(msgDataElements.length, 3);
        assert.deepEqual(msgDataElements[0].title, elementTitle1);
        assert.deepEqual(msgDataElements[0].quantity, quantity1);
        assert.deepEqual(msgDataElements[0].price, price1);
        assert.deepEqual(msgDataElements[0].currency, currency1);
        assert.deepEqual(msgDataElements[0].image_url, elemUrl1);
        assert.deepEqual(msgDataElements[0].subtitle, subtitle1);

        assert.deepEqual(msgDataElements[1].title, thirdTitle);
        assert.deepEqual(msgDataElements[1].quantity, undefined);
        assert.deepEqual(msgDataElements[1].price, undefined);
        assert.deepEqual(msgDataElements[1].currency, undefined);
        assert.deepEqual(msgDataElements[1].image_url, undefined);
        assert.deepEqual(msgDataElements[1].subtitle, undefined);

        assert.deepEqual(msgDataElements[2].title, elementTitle2);
        assert.deepEqual(msgDataElements[2].quantity, quantity2);
        assert.deepEqual(msgDataElements[2].price, price2);
        assert.deepEqual(msgDataElements[2].currency, currency2);
        assert.deepEqual(msgDataElements[2].image_url, elemUrl2);
        assert.deepEqual(msgDataElements[2].subtitle, subtitle2);
      });
    });

    describe('pushAdjustment', () => {
      const name1 = 'New Customer Discount';
      const amount1 = 20;
      const name2 = '$10 Off Coupon';
      const amount2 = 10;

      it('should create a single adjustment correctly', () => {
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod);
        msgData.pushAdjustment(name1, amount1);
        const msgDataAdjustments = msgData.toJSON().attachment.payload.adjustments;
        assert.equal(msgDataAdjustments.length, 1);
        assert.deepEqual(msgDataAdjustments[0].name, name1);
        assert.deepEqual(msgDataAdjustments[0].amount, amount1);
      });

      it('should create multiple adjustments correctly', () => {
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod);
        msgData.pushAdjustment(name1, amount1);
        msgData.pushAdjustment(name2, amount2);
        const msgDataAdjustments = msgData.toJSON().attachment.payload.adjustments;
        assert.equal(msgDataAdjustments.length, 2);
        assert.deepEqual(msgDataAdjustments[0].name, name1);
        assert.deepEqual(msgDataAdjustments[0].amount, amount1);

        assert.deepEqual(msgDataAdjustments[1].name, name2);
        assert.deepEqual(msgDataAdjustments[1].amount, amount2);
      });
    });

    describe('addSummary', () => {
      const totalCost1 = 56.14;
      const subtotal1 = 75.00;
      const totalTax1 = 6.19;
      const shippingCost1 = 4.95;

      const totalCost2 = 45.03;
      const subtotal2 = 125.00;
      const totalTax2 = 16.91;
      const shippingCost2 = 5.94;

      it('should create a summary without optional params correctly', () => {
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod);
        msgData.addSummary(totalCost1);
        const msgDataSummary = msgData.toJSON().attachment.payload.summary;
        assert.deepEqual(msgDataSummary.total_cost, totalCost1);
        assert.deepEqual(msgDataSummary.subtotal, undefined);
        assert.deepEqual(msgDataSummary.total_tax, undefined);
        assert.deepEqual(msgDataSummary.shipping_cost, undefined);
      });

      it('should create a summary with optional params correctly', () => {
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod);
        msgData.addSummary(totalCost1, subtotal1, totalTax1, shippingCost1);
        const msgDataSummary = msgData.toJSON().attachment.payload.summary;
        assert.deepEqual(msgDataSummary.total_cost, totalCost1);
        assert.deepEqual(msgDataSummary.subtotal, subtotal1);
        assert.deepEqual(msgDataSummary.total_tax, totalTax1);
        assert.deepEqual(msgDataSummary.shipping_cost, shippingCost1);
      });

      it('should override a summary correctly if called twice', () => {
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod);
        msgData.addSummary(totalCost1);
        let msgDataSummary = msgData.toJSON().attachment.payload.summary;
        assert.deepEqual(msgDataSummary.total_cost, totalCost1);
        assert.deepEqual(msgDataSummary.subtotal, undefined);
        assert.deepEqual(msgDataSummary.total_tax, undefined);
        assert.deepEqual(msgDataSummary.shipping_cost, undefined);

        msgData.addSummary(totalCost2, subtotal2, totalTax2, shippingCost2);
        msgDataSummary = msgData.toJSON().attachment.payload.summary;
        assert.deepEqual(msgDataSummary.total_cost, totalCost2);
        assert.deepEqual(msgDataSummary.subtotal, subtotal2);
        assert.deepEqual(msgDataSummary.total_tax, totalTax2);
        assert.deepEqual(msgDataSummary.shipping_cost, shippingCost2);
      });
    });

    describe('addShippingAddress', () => {
      const street1 = '1 Hacker Way';
      const city1 = 'Menlo Park';
      const postalCode1 = '94025';
      const state1 = 'CA';
      const country1 = 'US';
      const street12 = 'Apt #123';

      const street2 = '420 Guadalupe St.';
      const city2 = 'Austin';
      const postalCode2 = '78705';
      const state2 = 'TX';
      const country2 = 'US';
      const street22 = 'Suite #456';

      it('should create a shipping address without optional params correctly', () => {
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod);
        msgData.addShippingAddress(street1, city1, postalCode1, state1, country1);
        const msgDataSummary = msgData.toJSON().attachment.payload.address;
        assert.deepEqual(msgDataSummary.street_1, street1);
        assert.deepEqual(msgDataSummary.street_2, undefined);
        assert.deepEqual(msgDataSummary.city, city1);
        assert.deepEqual(msgDataSummary.postal_code, postalCode1);
        assert.deepEqual(msgDataSummary.state, state1);
        assert.deepEqual(msgDataSummary.country, country1);
      });

      it('should create a shipping address with optional params correctly', () => {
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod);
        msgData.addShippingAddress(street1, city1, postalCode1, state1, country1, street12);
        const msgDataSummary = msgData.toJSON().attachment.payload.address;
        assert.deepEqual(msgDataSummary.street_1, street1);
        assert.deepEqual(msgDataSummary.street_2, street12);
        assert.deepEqual(msgDataSummary.city, city1);
        assert.deepEqual(msgDataSummary.postal_code, postalCode1);
        assert.deepEqual(msgDataSummary.state, state1);
        assert.deepEqual(msgDataSummary.country, country1);
      });

      it('should override a shipping address correctly if called twice', () => {
        const msgData = new ReceiptMessageData(recipientName, orderNumber, currency, paymentMethod);
        msgData.addShippingAddress(street1, city1, postalCode1, state1, country1, street12);
        let msgDataSummary = msgData.toJSON().attachment.payload.address;
        assert.deepEqual(msgDataSummary.street_1, street1);
        assert.deepEqual(msgDataSummary.street_2, street12);
        assert.deepEqual(msgDataSummary.city, city1);
        assert.deepEqual(msgDataSummary.postal_code, postalCode1);
        assert.deepEqual(msgDataSummary.state, state1);
        assert.deepEqual(msgDataSummary.country, country1);

        msgData.addShippingAddress(street2, city2, postalCode2, state2, country2, street22);
        msgDataSummary = msgData.toJSON().attachment.payload.address;
        assert.deepEqual(msgDataSummary.street_1, street2);
        assert.deepEqual(msgDataSummary.street_2, street22);
        assert.deepEqual(msgDataSummary.city, city2);
        assert.deepEqual(msgDataSummary.postal_code, postalCode2);
        assert.deepEqual(msgDataSummary.state, state2);
        assert.deepEqual(msgDataSummary.country, country2);
      });
    });
  });
});
