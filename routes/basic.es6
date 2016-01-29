import {Router} from 'express';
import {exec} from 'shelljs'
import fs from 'fs'
import async from 'async'
import Convert from 'ansi-to-html';
var convert = new Convert();

const route = Router();

route.get('/', (req, res) => res.render('restaurant'));
route.get('/tools', (req, res) => res.render('tools'));
route.get('/tests', (req, res) => {
  let capture = '';
  const child = exec(`npm run test-no-nyan ${__dirname}/../tests/*-test.compiled.js`, {async: true, silent: true});
  child.stdout.on('data', data => capture += data);
  child.stderr.on('data', data => capture += data);
  child.stdout.on('message', data => capture += data);
  child.stdout.on('end', () => {
    res.type('text/html');
    var resultCapture = capture.replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;');
    res.send(convert.toHtml(resultCapture));
  });
});

export default route;