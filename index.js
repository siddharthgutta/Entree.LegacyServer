#!/usr/bin/env node

require('babel-register');

var server = require('./server').default;
var port = parseInt(process.env.BRANCHOFF_PORT) || process.env.PORT || 3000;

server.listen(port, () => console.log(`Listening on ${port}`));