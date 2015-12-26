import {Router} from 'express';

const route = Router();

route.get('/', (req, res) => res.render('app', {title: 'yolo-not used atm'}));
route.get('/tools', (req, res) => res.render('tools'));

export default route;