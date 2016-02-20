import {Router} from 'express';
import {exec} from 'shelljs';
import Convert from 'ansi-to-html';
import config from 'config';

const convert = new Convert();
const route = new Router();
const clientConfig = JSON.stringify(config.get('Client'));

route.get('/', (req, res) => res.render('registration', {
  config: clientConfig,
  title: 'Entrée · Order Ahead With SMS',
  description: `Text Entrée to order ahead at your favorite restaurants,
  get recommendations on where to eat, and find delicious deals`
}));

route.get('/restaurant', (req, res) => res.render('restaurant', {
  config: clientConfig,
  title: 'Entrée · Restaurant'
}));

route.get('/messenger', (req, res) => res.render('messenger', {
  config: clientConfig,
  title: 'Entrée · Messenger'
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
