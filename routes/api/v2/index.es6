import {Router} from 'express';
import {ip} from '../../../libs/utils.es6';
import Access from './access.es6';
import Message from './message.es6';
import Misc from './misc.es6';
import Restaurant from './restaurant.es6';
import passport from 'passport';

const router = new Router();


/**
 * Helper function for normalizing responses
 */
router.use((req, res, next) => {
  const _tags = ['router', req.url, ip(req)];

  let stat = 'tba';

  // updating the class functions for readability
  res.ok = function ok(data, message) {
    stat = 'ok';
    res.status(200);
    res.json({message, data: data && data.toJSON ? data.toJSON() : data});
    return this;
  };

  res.fail = function fail(message, data, status = 500) {
    stat = 'fail';
    res.status(status);
    res.json({status, message, data});
    return this;
  };

  // add multiple args
  res.debug = function debug(...args) {
    console.tag(...[..._tags, stat]).log(...args);
  };

  req.tags = _tags;

  next();
});

router.use(passport.initialize());
router.use(passport.session());

/**
 * API Controllers
 */
router.use('/access', Access);
router.use('/restaurant', Restaurant);
router.use('/message', Message);
router.use('/misc', Misc);

export default router;
