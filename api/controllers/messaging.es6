/**
 * Created by kfu on 4/13/16.
 */
import {FBMessenger} from '../../libs/msg/messenger.es6';
import config from 'config';
import * as Runtime from '../../libs/runtime.es6';
// import Promise from 'bluebird';
import Emitter, {Events} from '../events/index.es6';

const productionOrSandbox = Runtime.isProduction();

const facebookCreds = config.get(`Facebook`);

console.tag('api', 'controllers', 'messaging').log(`Using Facebook ${config.get('AppBranch')} Credentials`);
console.tag('api', 'controllers', 'messaging').log(`${facebookCreds}`);

const msgPlatform = new FBMessenger(facebookCreds.pageAccessToken, facebookCreds.verificationToken,
  facebookCreds.pageId, productionOrSandbox);
console.tag('api', 'controllers', 'messaging').info('Initialized FB Messenger');


msgPlatform.on(FBMessenger.RECEIVED, async event => {
  Emitter.emit(Events.MSG_RECEIVED, event);
});


/**
 * MsgPlatform strategy
 * @type {MsgPlatform}
 */
export const MsgPlatform = msgPlatform;
