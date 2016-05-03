/**
 * Created by kfu on 4/14/16.
 */

import MessageDataStrategy from './strategy.es6';

export default class ReceiptMessageData extends MessageDataStrategy {
  /**
   * Constructor for Receipt Message Data
   * Note: Summary & Elements are required
   *
   * @param {String} recipientName: REQUIRED name of the individual associated with the receipt
   * @param {String} orderNumber: REQUIRED UNIQUE number of the order (MUST BE UNIQUE or will error)
   * @param {String} currency: REQUIRED type of currency used in order, Ex: 'USD'
   * @param {String} paymentMethod: REQUIRED custom payment method details, Ex: 'Visa 1234'
   * @param {String} orderUrl: OPTIONAL url to order page/details if exists
   * @param {Number} timestamp: timestamp of the order itself
   * @returns {ReceiptMessageData} generic message data object
   */
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

  /**
   * Adding an element to the message data object
   *
   * @param {String} title: REQUIRED title of item
   * @param {Number} quantity: OPTIONAL quantity of item
   * @param {Number} price: OPTIONAL price of item
   * @param {String} currency: OPTIONAL currency of price - Ex: 'USD'
   * @param {String} imageUrl: OPTIONAL image URL of item
   * @param {String} subtitle: OPTIONAL subtitle of item
   * @return {Null} unused return statement
   */
  pushElement(title, quantity = null, price = null, currency = null, imageUrl = null, subtitle = null) {
    this.elements.push({
      title, subtitle, quantity, price, currency, image_url: imageUrl
    });
  }

  /**
   * Adding a payment adjustment to the receipt message data object
   *
   * @param {String} name: name of the payment adjustment
   * @param {Number} amount: amount of the payment adjustment
   * @return {Null} unused return statement
   */
  pushAdjustment(name, amount) {
    this.adjustments.push({
      name, amount
    });
  }

  /**
   * Adding a payment summary to the receipt message data object
   * Note: Using this function is necessary/REQUIRED
   *
   * @param {Number} totalCost: REQUIRED total cost for the receipt
   * @param {Number} subtotal: OPTIONAL subtotal cost for the receipt
   * @param {Number} totalTax: OPTIONAL total tax for the receipt
   * @param {Number} shippingCost: OPTIONAL shipping cost for the receipt
   * @return {Null} unused return statement
   */
  addSummary(totalCost, subtotal = null, totalTax = null, shippingCost = null) {
    this.messageData.attachment.payload.summary = {
      total_cost: totalCost,
      subtotal,
      total_tax: totalTax,
      shipping_cost: shippingCost
    };
  }

  /**
   * Adding a shipping address to the receipt message data object
   * Note: Using this function is unnecessary/OPTIONAL
   *
   * @param {String} street1: REQUIRED street address line 1
   * @param {String} city: REQUIRED city
   * @param {String} postalCode: REQUIRED US Postal Code
   * @param {String} state: REQUIRED Two-letter state abbreviation (US)
   * @param {String} country: REQUIRED Two-letter country abbreviation
   * @param {String} street2: OPTIONAL street address line 2
   * @return {Null} unused return statement
   */
  addShippingAddress(street1, city, postalCode, state, country, street2 = null) {
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
