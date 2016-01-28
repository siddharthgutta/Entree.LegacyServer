import Scribe from 'scribe-js'
import config from 'config'
import cluster from 'cluster'
import {exec} from 'shelljs'

export function resolveContext() {
  var port = parseInt(process.env.BRANCHOFF_PORT) || process.env.PORT || 3000;
  var socketPort = 50000 + (Number(process.env.pm_id) || port);
  var id = process.env.BRANCHOFF_BRANCH || (exec('git rev-parse --abbrev-ref HEAD', {silent: true}).output || '').trim() || 'local';
  var nodeEnv = process.env.NODE_ENV || "localbuild?";
  var ctx = {port, socketPort, id, nodeEnv};

  return ctx;
}

export function initScribe(override = true, mongo = true, socket = true, ...exposers) {

  console.log(`Scribe assuming you have mongo installed - ${mongo}!!!`);
  console.log(`Scribe assuming you socket port open - ${socket}!!!`);

  var context = resolveContext();

  var console = new Scribe(context.id, {
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
  }, ...["test", ...exposers]);

  console.persistent('tags', [context.port, context.nodeEnv]);

  if (override) {
    console.override();
  }

  return console;
}

export function initDatabase() {
  var context = resolveContext();

  // todo
}

export function initServer() {
  var context = resolveContext();

  require('./server').default.listen(context.port, () => console.log(`Listening on ${context.port}`));
}
