import {Router} from 'express';
import {exec} from 'shelljs'
import fs from 'fs'
import async from 'async'

const route = Router();

route.get('/', (req, res) => res.render('app', {title: 'yolo-not used atm'}));
route.get('/tools', (req, res) => res.render('tools'));
route.get('/tests', (req, res) => {
  let capture = '';
  const child = exec(`npm run test ${__dirname}/../tests/*.test.js`, {async: true, silent: true});
  child.stdout.on('data', data => capture += data);
  child.stderr.on('data', data => capture += data);
  child.stdout.on('message', data => capture += data);
  child.stdout.on('end', () => {
    res.type('text/plain');
    res.send(capture);
  });
});

export default route;