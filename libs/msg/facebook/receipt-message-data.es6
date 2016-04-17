/**
 * Created by kfu on 4/14/16.
 */

import MessageDataStrategy from './text-message-data.es6';

export default class ReceiptMessageData extends MessageDataStrategy {
  constructor(recipientName, orderNumber, currency, paymentMethod,
              orderUrl = null, timestamp = null) {
    super();
    this.elements = [];
    this.adjustments = [];
    this.messageData = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'receipt',
          recipient_name: recipientName,
          order_number: orderNumber,
          currency,
          payment_method: paymentMethod,
          order_url: orderUrl,
          timestamp,
          elements: this.elements,
          adjustments: this.adjustments
        }
      }
    };
  }

  addElement(title, subtitle, quantity, price, currency, imageUrl) {
    this.elements.push({
      title, subtitle, quantity, price, currency, image_url: imageUrl
    });
  }

  addAdjustment(name, amount) {
    this.adjustments.push({
      name, amount
    });
  }

  addSummary(totalCost, subtotal = null, totalTax = null, shippingCost = null) {
    this.messageData.attachment.payload.summary = {
      total_cost: totalCost,
      subtotal,
      total_tax: totalTax,
      shipping_cost: shippingCost
    };
  }

  addShippingAddress(street1, city, postalCode, state, country, street2) {
    this.messageData.attachment.payload.address = {
      street_1: street1,
      street_2: street2,
      city,
      postal_code: postalCode,
      state,
      country
    };
  }
}
