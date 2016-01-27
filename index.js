#!/usr/bin/env node
var Bootstrap = require('./bootstrap');

Bootstrap.initScribe();
Bootstrap.initDatabase();
Bootstrap.initServer();