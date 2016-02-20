import request from 'superagent';
import extend from 'extend';

export default function fetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
    if (typeof opts.body === 'object') {
      opts.headers = extend(true, opts.headers || {}, {'Content-Type': 'application/json'});
    }

    const method = opts.method || 'get';
    let req = request[method.toLowerCase()](url);

    if (method === 'post') {
      req = req.send(opts.body);
    }

    if (opts.headers) {
      for (const [k, v] of Object.entries(opts.headers)) {
        req = req.set(k, v);
      }
    }

    req.end((err, res) => {
      if (err) {
        if (res && res.body && res.body.status) {
          reject(new Error(res.body.message || 'Error not defined by the server'));
        } else {
          reject(new Error('Could not reach server?'));
        }
      } else {
        res.body = res.body || {};
        resolve(res);
      }
    });
  });
}
