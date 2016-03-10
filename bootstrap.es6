import Scribe from 'scribe-js';
import config from 'config';
import extend from 'extend';
import {TraceError} from './libs/utils.es6';
import Promise from 'bluebird';

export function initErrorHandling() {
  // Promise.suppressUnhandledRejections();
  Promise.config({longStackTraces: false});

  // useSourceOnError();
  global.TraceError = TraceError;
}

export function initScribe(override = true, mongo = true, socket = true, opts = {}, ...exposers) {
  console.log(`Scribe assuming you have mongo installed - ${mongo}!!!`);
  console.log(`Scribe assuming you socket port open - ${socket}!!!`);

  const id = config.get('AppId');
  const port = config.get('Server.port');
  const env = config.get('NodeEnv');

  const scribeConsole = new Scribe(id, extend(true, {
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
    socketPort: 50000 + (Number(process.env.pm_id) || port),
    socket,
    nwjs: {
      buildDir: `${__dirname}/../public/native`
    },
    web: {
      router: {
        username: 'build',
        password: 'build',
        authentication: true,
        useBodyParser: true
      },
      client: {
        socketPorts: [50000 + (Number(process.env.pm_id) || port)],
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

  scribeConsole.persistent('tags', [port, env]);

  if (override) {
    scribeConsole.override();
  }

  return scribeConsole;
}

export function initServer() {
  const port = config.get('Server.port');

  require('./server.es6').default.listen(port,
                                         () => console.tag('server').log(`Listening on ${port}`));
}
