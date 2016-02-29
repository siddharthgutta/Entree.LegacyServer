import request from 'superagent';
import extend from 'extend';

// mimics fetch using superagent to improve cross-browser compatibility
// refer to https://github.com/github/fetch for the fetch API
export default function fetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
    if (typeof opts.body === 'object') {
      opts.headers = extend(true, opts.headers || {}, {'Content-Type': 'application/json'});
    }

    const method = opts.method || 'get';
    let req = request[method.toLowerCase()](url);

    req = req.withCredentials();

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
        err.res = res;
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}
