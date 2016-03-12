/**
 * Created by kfu on 3/10/16.
 */

import {Router} from 'express';
import * as Braintree from '../api/payment.es6';

const route = new Router();

/**
 * Braintree Router
 * @type {Router}
 */
route.use(Braintree.initRouter());

export default route;
