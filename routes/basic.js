import {Router} from 'express';
import {exec} from 'shelljs'
import fs from 'fs'
import async from 'async'

const route = Router();

route.get('/', (req, res) => res.render('app', {title: 'yolo-not used atm'}));
route.get('/tools', (req, res) => res.render('tools'));
route.get('/tests', (req, res) => {
  let out = '';
  async.each(fs.readdirSync(`${__dirname}/../tests`), (file, callback) => {
    if (!/(\.test\.js)/g.test(file)) return callback();
    const child = exec(`npm run test ${__dirname}/../tests/${file}`, {async: true, silent: true});
    let data = '';
    child.stdout.on('data', o => data += o);
    child.stderr.on('data', o => data += o);
    child.stdout.on('message', o => data += o);
    child.stdout.on('end', () => {
      out += data;
      callback();
    });
  }, ()=> {
    process.nextTick(()=> {
      res.type('text/plain');
      res.send(out);
    });
  });
});

export default route;