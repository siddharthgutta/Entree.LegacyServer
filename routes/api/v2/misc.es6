import {Router} from 'express';
import {ip} from '../../../libs/utils.es6';

const router = new Router();

router.post('telemetry/:expose', (req, res) => {
  let tags = req.body.tags;
  let message = req.body.message;

  if (!tags) {
    tags = [];
  } else if (!Array.isArray(tags)) {
    tags = [tags];
  }

  if (!message) {
    message = [];
  } else if (!Array.isArray(tags)) {
    message = [message];
  }

  console.tag('telemetry', ip(req), ...tags).log(...message);

  res.status(200);
  res.ok('Logging telemetry');
});

export default router;
