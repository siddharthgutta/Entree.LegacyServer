process.env.NODE_CONFIG_DIR = `../config`;
import {initScribe} from '../bootstrap'
import path from 'path'
import stack from 'callsite'
const console = initScribe(true, false, false, false, false, false, false); // set to true
console.persistent("tags", []);
global.TEST = path.basename(stack()[7].getFileName());