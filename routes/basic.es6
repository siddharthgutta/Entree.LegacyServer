import {Router} from 'express';
import {exec} from 'shelljs';
import Convert from 'ansi-to-html';

const convert = new Convert();
const route = new Router();

route.get('/', (req, res) => res.render('restaurant'));
route.get('/tools', (req, res) => res.render('tools'));
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
