import * as Scribe from 'scribe-js';
import config from 'config';
import {TraceError, useSourceOnError} from './libs/utils.es6';
import {init as initMongo, close as closeMongo} from './models/mongo/index.es6';
import {init as initSQL, close as closeSQL} from './models/mysql/index.es6';
import Promise from 'bluebird';
import fs from 'fs';
import https from 'https';

export function initErrorHandling() {
  // Promise.suppressUnhandledRejections();
  Promise.config({longStackTraces: false});

  global.TraceError = TraceError;

  useSourceOnError();
}

export function initScribe(override = true, stdOnly = false, callSite = true) {
  const id = config.get('AppId');
  const port = config.get('Server.port');
  const env = config.get('NodeEnv');
  const socketPort = 50000 + (Number(process.env.pm_id) || port);
  const ssl = {
    key: fs.readFileSync(config.get('Server.sslKey')),
    cert: fs.readFileSync(config.get('Server.sslCert')),
    ca: fs.readFileSync(config.get('Server.sslCa')),
    rejectUnauthorized: config.get('Server.httpsRejectUnauthorized')
  };

  let server;

  if (!stdOnly) {
    server = https.createServer(ssl);
    server.listen(socketPort);
  }

  const options = {
    name: 'Entree',
    id,
    expose: {
      default: stdOnly ? [] : [
        'mongo-socket',
        'bash'
      ],
      test: ['bash'],
      express: stdOnly ? ['express-bash'] : [
        'express-mongo-socket',
        'express-bash'
      ]
    },
    'expose/pipeline': {
      'mongo-socket': [
        'transform/ErrorExtractor',
        'transform/ToJSON2',
        'transform/FullTextSerialize',
        'writer/MongoDB',
        'writer/SocketIO'
      ],
      'express-mongo-socket': [
        'transform/ExpressExtractor',
        'transform/ErrorExtractor',
        'transform/ToJSON2',
        'transform/FullTextSerialize',
        'writer/MongoDB',
        'writer/SocketIO'
      ],
      bash: [
        'transform/Inspector',
        'writer/DefaultConsole'
      ],
      'express-bash': [
        'transform/ExpressExtractor',
        'transform/ExpressInspector',
        'transform/Inspector',
        'writer/DefaultConsole'
      ]
    },
    module: {
      'transform/Inspector': {
        callsite: callSite
      },
      'writer/SocketIO': {
        server,
        options: {secure: true}
      },
      'router/Viewer/client': {
        background: '#131B21',
        socketPorts: [socketPort], // get other instance ports,
        options: {secure: true}
      }
    }
  };

  const scribe = Scribe.create(options);

  scribe.persistent('tags', [port, env]);

  if (override) {
    scribe.override();
  }

  return scribe;
}

export async function initDatabase(forceClear) {
  let clearSQL = config.get('MySQL.clearOnStart');
  let clearMongo = config.get('MongoDb.clearOnStart');

  if (forceClear === false) {
    clearMongo = false;
    clearSQL = false;
  } else if (forceClear === true) {
    clearSQL = true;
    clearMongo = true;
  }

  await initSQL(clearSQL);
  await initMongo(clearMongo);
}

export async function disconnectDatabase() {
  await closeSQL();
  await closeMongo();
}

export function initServer() {
  const port = config.get('Server.port');

  require('./server.es6').default.listen(port,
                                         () => console.tag('server').log(`Listening on ${port}`));
}
