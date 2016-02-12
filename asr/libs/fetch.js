import 'whatwg-fetch';

export default function fetch(url, opts = {}, json = true) {
  if (typeof opts.body === 'object') {
    opts.body = JSON.stringify(opts.body);
  }

  return window.fetch(url, opts)
      .then(res => res.json())
      .then(body => {
        const res = {body: {}};

        if (body.hasOwnProperty('status')) {
          if (!body.status) {
            if (json) {
              res.body = body;
            }

            return res;
          }
        }

        throw new Error(body.message);
      });
}
