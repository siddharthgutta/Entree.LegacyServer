import {Strategy as LocalStrategy} from 'passport-local';
import passport from 'passport';
import * as Restaurant from '../../../api/controllers/restaurant.es6';
import * as Session from '../../../api/controllers/session.es6';


/**
 * v2 authentication strategy
 */
passport.use('local', new LocalStrategy({
  usernameField: 'id',
  passwordField: 'password',
  passReqToCallback: true,
  session: true
}, async(req, id, password, done) => {
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
    const token = await Session.create(restaurant.id);
    next(null, {token});
  } catch (e) {
    next(e);
  }
}));

passport.serializeUser(({token}, done) => {
  console.tag('serialize').log(token);

  done(null, token);
});

// TODO provide REST validation
passport.deserializeUser(async(req, token, done) => {
  if (req.user) {
    return done(null, req.user);
  }

  const valid = await Session.isValid(token);

  if (!valid) {
    console.tag('deserialize').log('expired', {token});
    return done(null, null);
  }

  const {id} = await Session.getRestaurant(token);

  Session.renew(id, token); // async

  return done(null, {id, token});
});

export async function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  const {token} = req.body;

  if (token) {
    const valid = await Session.isValid(token);

    if (valid) {
      try {
        const {id} = await Session.getRestaurant(token);

        Session.renew(id, token); // async

        req.user = req.user || {};
        req.user.id = id;
        req.user.token = token;

        return next();
      } catch (e) {
        // ignore
      }
    }
  }

  res.fail('Not authenticated', null, 400);
}


/**
 * Auth middleware
 */
export default passport.authenticate('local');
