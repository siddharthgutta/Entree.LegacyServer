import {Router} from 'express';
import {isAuthenticated} from './authenticate.es6';

const router = new Router();

router.post('/orders', isAuthenticated, async (req, res) => {
  res.ok({status: 1});
});

export default router;
