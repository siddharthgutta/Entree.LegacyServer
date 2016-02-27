import {Strategy as LocalStrategy} from 'passport-local';
import passport from 'passport';
import * as Restaurant from '../../../api/restaurant.es6';
import * as Notification from '../../../api/notification.es6';


/**
 * v2 authentication strategy
 */
passport.use('local', new LocalStrategy({
  usernameField: 'id',
  passwordField: 'password',
  passReqToCallback: true,
  session: true
}, async (req, id, password, done) => {
  let restaurant;

  if (req.user) {
    return done(null, req.user);
  }

  try {
    restaurant = await Restaurant.findOne(id);
  } catch (e) {
    return done(null, false, e);
  }

  if (!restaurant) {
    return done(null, false);
  }

  const {password: expected} = restaurant;

  if (password !== expected) {
    return done(null, false);
  }

  try {
    const {token, uuid} = await Notification.createSocket(restaurant.id);
    const address = await Notification.address();
    done(null, {id, token, uuid, address});
  } catch (e) {
    done(null, false);
  }
}));

passport.serializeUser(({id, token, uuid}, done) => {
  const serialized = [id, token, uuid].join(';');
  done(null, serialized);
});

// TODO provide REST validation
passport.deserializeUser(async (req, access, done) => {
  const [id, token, uuid] = access.split(';');
  const valid = await Notification.isValidSocket(id, token);

  console.tag('deserialize').log({id, token, uuid});

  if (!valid) {
    done(null, null);
  }

  const address = await Notification.address();
  done(null, {id, token, uuid, address});
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
