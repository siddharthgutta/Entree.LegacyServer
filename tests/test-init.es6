import {initScribe} from '../bootstrap';
import path from 'path';
import stack from 'callsite';
import mongoose from 'mongoose';
import models from '../models/mysql/index.es6';

const console = initScribe(true, false, false,
    {inspector: {colors: false, callsite: false, pre: false, tags: false}}); // set to true
console.persistent('tags', []);
global.TEST = path.basename(stack()[7].getFileName());

export function initDatabase() {
  return new Promise(resolve => {
    for (const col in mongoose.connection.collections) { //eslint-disable-line
      mongoose.connection.collections[col].remove();
    }

    resolve(models.sequelize.sync({force: true})); // Remove once we finalize model
  });
}

export function disconnectDatabase() {
  mongoose.connection.close();
  models.sequelize.close();
}
