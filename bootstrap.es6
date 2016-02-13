import config from 'config';

export function initServer() {
  const port = config.get('Server.port');

  require('./server.es6').default.listen(port,
      () => console.log(`Listening on ${port}`));
}
