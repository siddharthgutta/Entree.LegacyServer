import 'babel-polyfill';
import Scribe from './scribe-client';

const console = new Scribe();

console.override();

window.onerror = (error, url, line) =>
    console.tag('window-error').error({error, url, line});
