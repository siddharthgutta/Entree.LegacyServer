import {Router} from 'express';
import {exec} from 'shelljs';
import Convert from 'ansi-to-html';
import config from 'config';

const convert = new Convert();
const route = new Router();
const clientConfig = JSON.stringify(config.get('Client'));

route.get('/', (req, res) => res.render('index', {
  config: clientConfig
}));

route.get('/restaurant', (req, res) => res.render('restaurant', {
  config: clientConfig,
  title: 'Entree · Restaurant',
  socket: true
}));

route.get('/welcome', (req, res) => res.render('registration', {
  config: clientConfig,
  title: 'Entree · Welcome',
  socket: false
}));

route.get('/messenger', (req, res) => res.render('messenger', {
  config: clientConfig,
  title: 'Entree · Messenger',
  socket: true
}));

route.get('/tests', (req, res) => {
  let capture = '';
  const child = exec(`npm run tests-no-nyan && npm run lint`, {async: true, silent: true, cwd: `${__dirname}/../`});
  child.stdout.on('data', data => capture += data);
  child.stderr.on('data', data => capture += data);
  child.stdout.on('message', data => capture += data);
  child.stdout.on('end', () => {
    res.type('text/html');
    const resultCapture = capture.replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;');
    res.send(convert.toHtml(resultCapture));
  });
});

export default route;
