#!/usr/bin/env node

// precompile on production
require('babel-register');

var Bootstrap = require('./bootstrap');

Bootstrap.initScribe();
Bootstrap.initDatabase();
Bootstrap.initServer();
