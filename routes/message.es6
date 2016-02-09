/**
 * Created by kfu on 2/8/16.
 */

import {Router} from 'express';
// import config from 'config';
const route = new Router();
// import io from '../message/sio.es6';

route.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.ok = (tags, logMessage, data, resMessage) => {
    console.tag(...tags).log(logMessage);
    res.json({status: 0, data: data.toJSON ? data.toJSON() : data, message: resMessage});
  };
  res.fail = (tags, logMessage, resMessage, status) => {
    console.tag(...tags).log(logMessage);
    res.json({status: status || 1, message: resMessage});
  };
  next();
});

// route.post('/', (req, res) => {
//   const {id, message, from, to, time} = req.body;
//
// });

export default route;
