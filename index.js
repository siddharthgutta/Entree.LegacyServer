#!/usr/bin/env node

// precompile on production
require('babel-register');

var Scribe = require('scribe-js');
var config = require('config');
var cluster = require('cluster');

var PORT = parseInt(process.env.BRANCHOFF_PORT) || process.env.PORT || 3000;
var SOCKET_PORT = 50000 + Number(process.env.pm_id) || PORT;
var NAME = process.env.BRANCHOFF_BRANCH || PORT;

var console = new Scribe(NAME, {
  name: 'Entree',
  mongoUri: 'mongodb://localhost/scribe',
  basePath: 'scribe/',
  socketPort: SOCKET_PORT,
  nwjs: {
    buildDir: `${__dirname}/../public/native`
  },
  web: {
    router: {
      username: 'build',
      password: 'build',
      authentication: true,
      sessionSecret: 'scribe-session',
      useBodyParser: true,
      useSession: true
    },
    client: {
      port: PORT,
      socketPorts: [SOCKET_PORT],
      exposed: {
        all: {label: 'all', query: {expose: {$exists: true}}},
        error: {label: 'error', query: {expose: 'error'}},
        express: {label: 'express', query: {expose: 'express'}},
        info: {label: 'info', query: {expose: 'info'}},
        log: {label: 'log', query: {expose: 'log'}},
        warn: {label: 'warn', query: {expose: 'warn'}},
        trace: {label: 'trace', query: {expose: 'trace'}},
        timing: {label: 'time', query: {expose: 'timing'}},
        user: {label: 'user', query: {'transient.tags': {$in: ['USER ID']}}}
      }
    }
  },
  native: {},
  debug: false
});

console.persistent('tags', [NAME, process.env.NODE_ENV || "LOCAL_BUILD?"]);
console.override();

var server = require('./server').default;

server.listen(PORT, () => console.log(`Listening on ${PORT}`));