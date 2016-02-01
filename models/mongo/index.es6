import fs from 'fs';
import path from 'path';
import config from 'config';
import mongoose from 'mongoose';

const mongoConfig = config.get('MongoDb');
const basename = path.basename(module.filename);
mongoose.connect(`mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`);
const db = {};

fs.readdirSync(__dirname)
    .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
    .forEach(file => {
      const schema = require(path.join(__dirname, file));
      Object.keys(schema).forEach(modelName => {
        db[modelName] = mongoose.model(modelName, schema[modelName]);
      });
    });

export default db;
