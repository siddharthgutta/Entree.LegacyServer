/**
 * Created by kfu on 4/13/16.
 */

import * as Payment from '../../api/payment.es6';
import * as Runtime from '../../libs/runtime.es6';
import * as Bootstrap from '../../bootstrap.es6';

Bootstrap.initErrorHandling();
Bootstrap.initScribe();
console.log('Production: ', Runtime.isProduction());

// Temporary Solution for releasing transactions from escrow until we
// have a decent amount of orders and have a need to implement cronjobs
process.argv.forEach(async (val, index) => {
  // Skip node and the script name (index 0 and 1)
  if (index > 1) {
    const logLine = `${index - 1}: Transaction Release with id [${val}] to producer`;
    try {
      const transaction = await Payment.releasePaymentToProducer(val);
      console.log(transaction);
      console.log(`${logLine}:SUCCEEDED`);
    } catch (err) {
      console.log(`${logLine}:FAILED`);
      console.log(JSON.stringify(err));
      throw err;
    }
  }
});
