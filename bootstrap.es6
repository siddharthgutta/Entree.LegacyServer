import Scribe from 'scribe-js';
import config from 'config';
import models from './models/mysql/index.es6';
import mongoose from 'mongoose';
import extend from 'extend';
import {deprecate} from './libs/utils.es6';

export function resolveContext() {
  return deprecate(() => {
    const port = config.get('Server.port');
    const id = config.get('AppId');
    const nodeEnv = config.get('NodeEnv');
    const ctx = {port, id, nodeEnv};

    return ctx;
  }, 'bootstrap.es6#resolveContext: Use config.get(...) instead!');
}

export function initScribe(override = true, mongo = true, socket = true, opts = {}, ...exposers) {
  console.log(`Scribe assuming you have mongo installed - ${mongo}!!!`);
  console.log(`Scribe assuming you socket port open - ${socket}!!!`);

  const context = resolveContext();

  const scribeConsole = new Scribe(context.id, extend(true, {
    inspector: {
      colors: true,
      showHidden: false,
      depth: 5,
      pre: true,
      callsite: false,
      tags: true,
      args: true,
      metrics: true
    },
    name: 'Entree',
    mongoUri: 'mongodb://localhost/scribe',
    mongo,
    basePath: 'scribe/',
    socketPort: 50000 + (Number(process.env.pm_id) || context.port),
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
  }, opts), ...['test', ...exposers]);

  scribeConsole.persistent('tags', [context.port, context.nodeEnv]);

  if (override) {
    scribeConsole.override();
  }

  return scribeConsole;
}

export function initDatabase() {
  return new Promise(resolve => {
    for (const col in mongoose.connection.collections) { //eslint-disable-line
      mongoose.connection.collections[col].remove();
    }

    resolve(models.sequelize.sync({force: true})); // Remove once we finalize model
  });
}

export function destroyDatabase() {
  mongoose.connection.close();
  models.sequelize.close();
}

export function initServer() {
  const context = resolveContext();

  require('./server.es6').default.listen(context.port,
      () => console.tag('server').log(`Listening on ${context.port}`));
}
