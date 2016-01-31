import Scribe from 'scribe-js'
import config from 'config'
import cluster from 'cluster'
import {exec} from 'shelljs'
import models from './models/mysql/index.es6'
import mongoose from 'mongoose'


export function resolveContext() {
  var port = parseInt(process.env.BRANCHOFF_PORT) || process.env.PORT || 3000;
  var socketPort = 50000 + (Number(process.env.pm_id) || port);// jscs:ignore requireCamelCaseOrUpperCaseIdentifiers
  var id = process.env.BRANCHOFF_BRANCH || (exec('git rev-parse --abbrev-ref HEAD', {silent: true}).output || '').trim() || 'local';
  var nodeEnv = process.env.NODE_ENV || 'localbuild?';
  var ctx = {port, socketPort, id, nodeEnv};

  return ctx;
}

export function initScribe(override = true, mongo = true, socket = true, opts = {}, ...exposers) {

  console.log(`Scribe assuming you have mongo installed - ${mongo}!!!`);
  console.log(`Scribe assuming you socket port open - ${socket}!!!`);

  var context = resolveContext();

  var scribeConsole = new Scribe(context.id, {
    inspector: {
      colors: true,
      showHidden: false,
      depth: 5,
      pre: true,
      callsite: true,
      tags: true,
      args: true,
      metrics: true,
      ...opts
    },
    name: 'Entree',
    mongoUri: 'mongodb://localhost/scribe',
    mongo,
    basePath: 'scribe/',
    socketPort: context.socketPort,
    socket,
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
        socketPorts: [context.socketPort],
        exposed: {
          all: {label: 'all', query: {expose: {$exists: true}}},
          error: {label: 'error', query: {expose: 'error'}},
          express: {label: 'express', query: {expose: 'express'}},
          info: {label: 'info', query: {expose: 'info'}},
          log: {label: 'log', query: {expose: 'log'}},
          warn: {label: 'warn', query: {expose: 'warn'}},
          trace: {label: 'trace', query: {expose: 'trace'}},
          test: {label: 'test', query: {expose: 'test'}},
          timing: {label: 'time', query: {expose: 'timing'}},
          user: {label: 'user', query: {'transient.tags': {$in: ['USER ID']}}}
        }
      }
    },
    native: {},
    debug: false
  }, ...['test', ...exposers]);

  scribeConsole.persistent('tags', [context.port, context.nodeEnv]);

  if (override) {
    scribeConsole.override();
  }

  return scribeConsole;
}

export function initDatabase() {
  models.sequelize.sync({force: true}); // Remove once we finalize model

  var mongoConfig = config.get('MongoDb');
  mongoose.connect(`mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`);
}

export function destroyDatabase() {
  mongoose.connection.close();
  models.sequelize.close();
}

export function initServer() {
  var context = resolveContext();

  require('./server.es6').default.listen(context.port, () => console.log(`Listening on ${context.port}`));
}

