import {initScribe} from '../bootstrap';
import path from 'path';
import stack from 'callsite';
import mongoose from 'mongoose';
import models from '../models/mysql/index.es6';
import config from 'config';

const console = initScribe(true, false, false,
                           {inspector: {colors: false, callsite: false, pre: false, tags: false}}); // set to true
console.persistent('tags', []);
global.TEST = path.basename(stack()[7].getFileName());

export function clearDatabase() {
  return new Promise((resolve, reject) => {
    if (config.get('MySQL.database') === 'entree_test') {
      for (const col in mongoose.connection.collections) { //eslint-disable-line
        mongoose.connection.collections[col].remove();
      }

      models.sequelize.query('SET FOREIGN_KEY_CHECKS=0')
        .then(() => models.sequelize.sync({force: true}))
        .then(() => models.sequelize.query('SET FOREIGN_KEY_CHECKS=1'))
        .then(() => resolve())
        .catch(err => reject(err));
    } else {
      reject(Error('Run the tests with NODE_ENV=staging or else you will clear the' +
        'production database!'));
    }
  });
}

export function disconnectDatabase() {
  mongoose.connection.close();
  models.sequelize.close();
}
