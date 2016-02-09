import {exec} from 'shelljs';

export function resolveContext() {
  const port = parseInt(process.env.BRANCHOFF_PORT, 10) || process.env.PORT || 3000;
  const socketPort = 50000 + (Number(process.env.pm_id) || port);
  const id = process.env.BRANCHOFF_BRANCH || (exec('git rev-parse --abbrev-ref HEAD',
          {silent: true}).output || '').trim() || 'local';
  const nodeEnv = process.env.NODE_ENV || 'localbuild?';
  const ctx = {port, socketPort, id, nodeEnv};

  return ctx;
}

export function initServer() {
  const context = resolveContext();

  require('./server.es6').default.listen(context.port,
      () => console.log(`Listening on ${context.port}`));
}
