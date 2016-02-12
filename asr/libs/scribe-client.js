import BasicConsole from 'scribe-js/dist/readers/BasicConsole';
import JSON2Converter from 'scribe-js/dist/transforms/JSON2Converter';
import ErrorExtractor from 'scribe-js/dist/transforms/ErrorExtractor';
import fetch from './fetch';

const _console = window.console;
window._console = _console;

class ChromeInspector {
  constructor(opts = {styles: {}}) {
    this.opts = opts;
  }

  through(data, callback) {
    const ptags = data.persistent.tags || [];
    const ttags = data.transient.tags || [];
    const tags = (ptags).concat(ttags);
    const app = data.persistent.app;
    const id = data.persistent.id;
    const opts = this.opts;

    _console.log(
        `%c${app}-${id} %c${data.expose.toUpperCase()} ${tags.map(a => `%c${a.toUpperCase()}`).join(' ')}`,
        opts.styles.pre,
        opts.styles.expose,
        ...ptags.map(() => opts.styles.ptags),
        ...ttags.map(() => opts.styles.ttags),
        ...data.args);

    callback();
  }
}

export default function (id, opts = {
  inspector: {
    styles: {
      pre: `color: #000;font-weight: bold; text-align: center`,
      expose: `color: #D6BF55;font-weight: bold; text-align: center`,
      ptags: 'color: #288F8E; font-weight: bold; text-align: center',
      ttags: 'color: #9B7AA6;'
    }
  }
}, exposers = []) {
  const console = new BasicConsole('client', 0);

  console.exposed().concat(exposers).forEach(expose => {
    console.expose(expose);

    console.pipe(expose, 'console', new ErrorExtractor(), new JSON2Converter(), new ChromeInspector(opts.inspector));

    console.pipe(expose, 'request',
        new ErrorExtractor(),
        new JSON2Converter(), {
          through(data, callback) {
            fetch('/api/telemetry/log', {
              method: 'post', body: {
                tags: data.transient.tags,
                message: data.args
              }
            }).then(res => _console.log(res.body.data))
                .catch(err => _console.error(err))
                .then(callback);
          }
        });
  });

  return console;
}
