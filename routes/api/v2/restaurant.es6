import {Router} from 'express';
import authenticate from './authenticate.es6';

const router = new Router();

router.post('/orders', authenticate, async (req, res) => {
  res.ok({status: 1});
});

export default router;
