import {getPubSub} from './test-init.es6';
import assert from 'assert';

const psa = getPubSub();
const psb = getPubSub();

describe(global.TEST, () => {
  it('should create socket-server', async () => {
    await psa.connect();
    await psb.connect();
  });

  it('should receive twilio messages', async done => {
    psb.Master.once('twilio-sent', () => {
      throw new Error('Should receive message');
    });

    psa.Master.once('twilio-sent', ({origin, receipt}) => {
      assert(origin, psb.origin);
      assert(receipt.to, '+17135011837');
      done();
    });

    const from = await psb.Master.emit('twilio-number');
    await psb.Master.emit('twilio-send', {to: '+17135011837', from, body: 'testing receive'});
  });

  it('should disconnect socket-server', () => {
    psa.disconnect();
    psb.disconnect();
  });
});
