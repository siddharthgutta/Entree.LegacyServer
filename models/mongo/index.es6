import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

var mongoConfig = config.get('MongoDb');
var basename  = path.basename(module.filename);
mongoose.connect(`mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`);
var db = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(function(file) {
        var schema = require(path.join(__dirname, file));
        Object.keys(schema).forEach(function(modelName) {
            db[modelName] = mongoose.model(modelName, schema[modelName]);
        });
    });

export default db;
