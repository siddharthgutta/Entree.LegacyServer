/**
 * Created by kfu on 4/13/16.
 */

import {Router} from 'express';
import {MsgPlatform} from '../api/controllers/messaging.es6';
import {FBMessenger} from '../libs/msg/messenger.es6';

const route = new Router();

if (MsgPlatform instanceof FBMessenger) {
  route.use(MsgPlatform.router());
}

export default route;
