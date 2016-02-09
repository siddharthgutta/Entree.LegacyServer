/**
 * Created by kfu on 2/9/16.
 */

import io from '../message/sio.es6';

export const messenger = io
  .of('/messenger')
  .on('connection', socket => {
    socket.emit('a message', {
      that: 'only',
      '/messenger': 'will get'
    });
    messenger.emit('a message', {
      everyone: 'in',
      '/messenger': 'will get'
    });
  });
