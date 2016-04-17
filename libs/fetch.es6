import request from 'superagent';
import extend from 'extend';
import URL from 'url-parse';

// mimics fetch using superagent to improve cross-browser compatibility
// refer to https://github.com/github/fetch for the fetch API
export default function fetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
    if (typeof opts.body === 'object') {
      opts.headers = extend(true, {'Content-Type': 'application/json'}, opts.headers || {});
    }

    const method = opts.method || 'get';

    if (method === 'get') {
      const urlParts = new URL(url, true);
      urlParts.query = Object.assign(urlParts.query || {}, opts.body);
      url = urlParts.toString();
    }

    let req = request[method.toLowerCase()](url);

    // req = req.withCredentials();

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
        try {
          if (err.response && err.response.error) {
            err = err.response.error;
          } else if (res.error) {
            err = res.error;
          }

          const {status, method: _method, path, text} = err;

          Object.defineProperty(err, 'res', {value: res, enumerable: false, configurable: false});
          Object.defineProperty(err, 'status', {value: status, enumerable: false, configurable: false});
          Object.defineProperty(err, 'method', {value: _method, enumerable: false, configurable: false});
          Object.defineProperty(err, 'path', {value: path, enumerable: false, configurable: false});
          Object.defineProperty(err, 'text', {value: text, enumerable: false, configurable: false});
        } catch (e) {
          try {
            Object.defineProperty(err, 'res', {value: res, enumerable: false, configurable: false});
          } catch (ee) {
            // fallback for crappy browsers
            err.res = res;
          }
        }

        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}
