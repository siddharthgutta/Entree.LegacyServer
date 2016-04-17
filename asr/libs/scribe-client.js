import BasicConsole from 'scribe-js/dist/reader/BasicConsole';
import ToJSON2 from 'scribe-js/dist/transform/ToJSON2';
import ErrorExtractor from 'scribe-js/dist/transform/ErrorExtractor';
import fetch from './fetch.es6';
import config from './config';
import {format} from 'url';

const SERVER_URL = format(config.get('Server'));

class ChromeInspector {
  constructor() {
    this.opts = {
      styles: {
        pre: `color: #000;font-weight: bold; text-align: center`,
        expose: `color: #D6BF55;font-weight: bold; text-align: center`,
        ptags: 'color: #288F8E; font-weight: bold; text-align: center',
        ttags: 'color: #9B7AA6;'
      }
    };
  }

  through(data, callback) {
    const ptags = data.persistent.tags || [];
    const ttags = data.transient.tags || [];
    const tags = ptags.concat(ttags);
    const app = data.persistent.app;
    const id = data.persistent.id;
    const opts = this.opts;

    window.console.log(
      `%c${app}-${id} %c${data.expose.toUpperCase()} ${tags.map(a => `%c${a.toUpperCase()}`).join(' ')}`,
      opts.styles.pre,
      opts.styles.expose,
      ...ptags.map(() => opts.styles.ptags),
      ...ttags.map(() => opts.styles.ttags),
      ...data.args);

    callback();
  }
}

class LogPusher {
  through(data, callback) {
    const ptags = data.persistent.tags || [];
    const ttags = data.transient.tags || [];

    fetch(`${window.cordova ? SERVER_URL : ''}/api/v2/telemetry/${data.expose}`, {
      method: 'post',
      body: {
        tags: ptags.concat(ttags).concat(['']),
        message: data.args
      }
    }).then(res => window.console.log(res.body.data))
      .catch(err => window.console.error(err))
      .then(() => callback());
  }
}

export default function (id, opts, exposers = []) {
  const console = new BasicConsole({name: 'client', id: 0});

  // TODO use Scribe.create pipeline for client
  console.log(new ErrorExtractor());
  console.exposed().concat(exposers).forEach(expose => {
    console.expose(expose);
    console.pipe(expose, 'console', new ErrorExtractor(), new ToJSON2(), new ChromeInspector());
    console.pipe(expose, 'request', new ErrorExtractor(), new ToJSON2(), new LogPusher());
  });

  return console;
}
