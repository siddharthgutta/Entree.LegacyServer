process.env.NODE_CONFIG_DIR = `../config`;
import {initScribe} from '../bootstrap';
import path from 'path';
import stack from 'callsite';
import config from 'config';
import mongoose from 'mongoose';
import models from '../models/mysql/index.es6';

const console = initScribe(true, false, false, false, false, false, false); // set to true
console.persistent('tags', []);
global.TEST = path.basename(stack()[7].getFileName());

var mongoConfig = config.mongo;
mongoose.connect(`mongodb://${mongoConfig.username}:${mongoConfig.password}@` +
  `${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`);

models.sequelize.sync({force: true}); // Remove once we finalize model

