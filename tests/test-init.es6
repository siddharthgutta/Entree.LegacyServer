process.env.NODE_CONFIG_DIR = `../config`;
import {initScribe, initDatabase} from '../bootstrap';
import path from 'path';
import stack from 'callsite';
import config from 'config';
import mongoose from 'mongoose';
import models from '../models/mysql/index.es6';

const console = initScribe(true, false, false, {colors: false, callsite: false, pre: false, tags: false}); // set to true
console.persistent('tags', []);
global.TEST = path.basename(stack()[7].getFileName());

//initDatabase();
