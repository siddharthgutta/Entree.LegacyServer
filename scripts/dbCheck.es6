/**
 * Created by jadesym on 3/28/16.
 */

import * as Runtime from '../libs/runtime.es6';
import * as Bootstrap from '../bootstrap.es6';
import config from 'config';

Bootstrap.initErrorHandling();
console.log('Production: ', Runtime.isProduction());
console.log('DB revision:', config.get('MySQL.revision'));
