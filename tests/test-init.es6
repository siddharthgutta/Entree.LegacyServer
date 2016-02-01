import {initScribe} from '../bootstrap';
import path from 'path';
import stack from 'callsite';

const console = initScribe(true, false, false,
  {inspector: {colors: false, callsite: false, pre: false, tags: false}}); // set to true
console.persistent('tags', []);
global.TEST = path.basename(stack()[7].getFileName());
