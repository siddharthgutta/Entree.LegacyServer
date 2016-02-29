/**
 * Created by kfu on 2/27/16.
 */

export default class PaymentStrategy {
  constructor() {
  }

  /**
   * Calculates the service fee based upon the percentage rate and per transaction fee
   *
   * @param {Number} orderTotal: order total in whole number cents
   * @param {Number} percentageFee: percent of the transaction as service fee Ex: 5% -> 5
   * @param {Number} perTransactionFee: cent amount per transaction as fee Ex: 30c -> 30
   * @returns {Number} total service fee calculated in cents
   */
  calculateServiceFee(orderTotal, percentageFee, perTransactionFee) {
    return Math.round(orderTotal * percentageFee / 100 + perTransactionFee);
  }

  transaction() {
    throw new Error('Not implemented');
  }

}
