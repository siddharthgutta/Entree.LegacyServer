import {Router} from 'express';
import sio from '../message/sio'

const route = Router();

function emit(event, ...args) {
  sio.sockets.emit(event, ...args);
}

route.get('/', (req, res) => res.send("Not implemented"));

setInterval(() => {
  emit('message', {data: 'Socket.IO Demo - Data sent at ' + Date.now()});
}, 3000);

export default route;