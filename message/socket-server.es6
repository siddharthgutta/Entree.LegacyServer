import request from 'superagent';
import {format} from 'url';

class SocketServer {
  constructor({protocol, host, port, path = '', search = '?'}) {
    this.uri = format({protocol, host, path, search, port});
  }

  attach() {
    // ignore
  }

  emit(channel, data) {
    // TODO
    request
        .post(this.uri)
        .send({channel, data})
        .end((err, req) => {
          console.log(err, req);
        });
  }
}

export default SocketServer;
