/**
 * Created by kfu on 4/13/16.
 */
import {FBMessenger} from '../../libs/msg/messenger.es6';
import config from 'config';
import * as Runtime from '../../libs/runtime.es6';
// import Promise from 'bluebird';
import Emitter, {Events} from '../events/index.es6';

const productionOrSandbox = Runtime.isProduction();

// TODO FIX:Temporary Solution for now
let facebookCreds;
const port = config.get('Server.port');
if (productionOrSandbox) {
  console.tag('api', 'controllers', 'messaging').log('Using Facebook Production Credentials');
  facebookCreds = config.get(`Facebook.production`);
} else if (port === 3030) {
  console.tag('api', 'controllers', 'messaging').log('Using Facebook Dev Credentials');
  facebookCreds = config.get(`Facebook.dev`);
} else if (port === 3031) {
  console.tag('api', 'controllers', 'messaging').log('Using Facebook KFU Dev Credentials');
  facebookCreds = config.get(`Facebook.kfu`);
} else if (port === 3032) {
  console.tag('api', 'controllers', 'messaging').log('Using Facebook JLMAO Dev Credentials');
  facebookCreds = config.get(`Facebook.jlmao`);
} else if (port === 3033) {
  console.tag('api', 'controllers', 'messaging').log('Using Facebook MKurian Dev Credentials');
  facebookCreds = config.get(`Facebook.mkurian`);
} else {
  // This will not be connected to any webhooks, you must test on dev, production, or the
  // individual dev branches
  console.tag('api', 'controllers', 'messaging').log('Using Facebook Production Credentials');
  facebookCreds = config.get(`Facebook.production`);
}

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
