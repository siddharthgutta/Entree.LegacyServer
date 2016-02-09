import {log} from './utils';

window.onerror = (error, url, line) =>  // eslint-disable-line
    log(['window-error'], {error, url, line});
