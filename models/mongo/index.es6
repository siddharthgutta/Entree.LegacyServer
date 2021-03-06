import fs from 'fs';
import path from 'path';
import config from 'config';
import mongoose from 'mongoose';
import Promise from 'bluebird';

const mongoConfig = config.get('MongoDb');
mongoose.Promise = Promise;
mongoose.connect(`mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`);

const basename = path.basename(module.filename);
const db = Object.create(null);

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, file)).default;
    db[model.modelName] = model;
    exports[model.modelName] = model;
  });

db.mongoose = mongoose;

export async function close() {
  mongoose.connection.close();
}

export async function clear() {
  const collections = mongoose.connection.collections;
  for (const col in collections) { //eslint-disable-line
    if (collections.hasOwnProperty(col)) {
      collections[col].remove();
    }
  }
}

export async function init(clearAll = false) {
  if (clearAll) {
    await clear();
  }
}

export default db;
