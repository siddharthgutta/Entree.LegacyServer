import {Strategy as LocalStrategy} from 'passport-local';
import passport from 'passport';
import * as Restaurant from '../../../api/controllers/restaurant.es6';
import * as Notification from '../../../api/controllers/notification.es6';


/**
 * v2 authentication strategy
 */
passport.use('local', new LocalStrategy({
  usernameField: 'id',
  passwordField: 'password',
  passReqToCallback: true,
  session: true
}, async (req, id, password, done) => {
  function next(a = null, res = false) {
    console.tag('passport').log(res);
    done(a, res);
  }

  let restaurant;

  if (req.user) {
    return next(null, req.user);
  }

  try {
    restaurant = await Restaurant.Model.findOne(id);
  } catch (e) {
    return next(e);
  }

  if (!restaurant) {
    return next();
  }

  const {password: expected} = restaurant;

  if (password !== expected) {
    return next();
  }

  try {
    const {token, uuid} = await Notification.createSocket(restaurant.id);
    const address = await Notification.address();
    next(null, {id, token, uuid, address});
  } catch (e) {
    next(e);
  }
}));

passport.serializeUser(({id, token, uuid}, done) => {
  const serialized = [id, token, uuid].join(';');

  console.tag('serialize').log(serialized);

  done(null, serialized);
});

// TODO provide REST validation
passport.deserializeUser(async (req, access, done) => {
  const [id, token, uuid] = access.split(';');
  const valid = await Notification.isValidSocket(id, token);

  console.tag('deserialize').log({id, token, uuid});

  if (!valid) {
    return done(null, null);
  }

  try {
    const address = await Notification.address();
    done(null, {id, token, uuid, address});
  } catch (e) {
    done(null, null);
  }
});

export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  res.fail('Not authenticated', null, 400);
}


/**
 * Auth middleware
 */
export default passport.authenticate('local');
