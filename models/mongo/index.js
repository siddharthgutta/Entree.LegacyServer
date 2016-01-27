'use strict'

var fs        = require('fs');
var path      = require('path');
var basename  = path.basename(module.filename);
var mongoose = require('mongoose');
var db = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(function(file) {
        var schema = require(path.join(__dirname, file.slice(0, -3)));
        Object.keys(schema).forEach(function(modelName) {
            db[modelName] = mongoose.model(modelName, schema[modelName]);
        });
    });

module.exports = db;
