import {Router} from 'express';
import V1 from './api/v1/index.es6';
import V2 from './api/v2/index.es6';
import db from '../models/mongo/index.es6';
import connectMongo from 'connect-mongo';
import session from 'express-session';
import cors from 'cors';


const router = new Router();
const MongoStore = connectMongo(session);


/**
 * Cross Origin
 */
router.use(cors());


/**
 * Cluster friendly sessions
 */
const sessionOpts = {
  secret: 'keyboard cat',
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: db.mongoose.connection}),
  resave: false
};

router.use(session(sessionOpts));


/**
 * Versioned apis
 */
router.use('/v1', V1);
router.use('/v2', V2);


/**
 * Catching all errors
 */
router.use((err, req, res, next) => {
  const message = err.message;
  res.status(500);
  res.json({status: 1, message});
  next(err);
});


export default router;
