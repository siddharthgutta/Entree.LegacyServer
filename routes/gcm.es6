import {Router} from 'express';
import {gcm} from '../api/controllers/notification.es6';

const route = new Router();

route.use(gcm.router());

export default route;
