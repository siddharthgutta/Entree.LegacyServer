import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose'

var basename  = path.basename(module.filename);
var db = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-4) === '.es6');
    })
    .forEach(function(file) {
        var schema = require(path.join(__dirname, file));
        Object.keys(schema).forEach(function(modelName) {
            db[modelName] = mongoose.model(modelName, schema[modelName]);
        });
    });

export default db;
