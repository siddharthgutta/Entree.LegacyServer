/**
 * Created by kfu on 4/13/16.
 */
import {FBMessenger} from '../../libs/msg/messenger.es6';
import config from 'config';
// import Promise from 'bluebird';
// import Emitter, {Events} from '../events/index.es6';

const msgPlatform = new FBMessenger(config.get('Facebook.page_access_token'));
console.tag('api', 'controllers', 'messaging').info('Initialized FB Messenger');

/*
msgPlatform.on(MsgPlatform.RECEIVED, async msg => {
});
*/

/**
 * MsgPlatform strategy
 * @type {MsgPlatform}
 */
export const MsgPlatform = msgPlatform;
