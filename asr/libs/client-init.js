import 'babel-polyfill';
import browser from 'detect-browser';
import Scribe from './scribe-client';

export const console2 = new Scribe();

console2.persistent('tags', [browser.name, browser.version]);

window.console2 = console2;

window.onerror = (error, url, line) =>
    console2.tag('window-error').error({error, url, line});
