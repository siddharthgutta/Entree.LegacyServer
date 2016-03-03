import fs from 'fs';
import path from 'path';
import config from 'config';
import mongoose from 'mongoose';

const mongoConfig = config.get('MongoDb');
mongoose.Promise = require('bluebird');
mongoose.connect(`mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`);

const basename = path.basename(module.filename);
const db = {};

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, file)).default;
    db[model.modelName] = model;
    exports[model.modelName] = model;
  });

db.mongoose = mongoose;

export default db;
