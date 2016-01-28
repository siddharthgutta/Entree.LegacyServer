import fs from 'fs'
import {initScribe} from '../bootstrap.es6'

initScribe(true, false, false);

let port = process.env.PORT || 3000;

try {
  port = JSON.parse(fs.readFileSync('../branchoff@instance', {encoding: "utf8"})).port;
} catch (e) {
  // ignore
}

export default port