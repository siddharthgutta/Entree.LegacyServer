import fetch from '../../libs/fetch.es6';

// Default Fetch API
// refer to https://github.com/github/fetch
export {default as fetch} from '../../libs/fetch.es6';

// fetch tailored for Entree responses
export default async function (url, opts = {}) {
  try {
    const res = fetch(url, opts);
    res.body = res.body || {};
    return res;
  } catch (err) {
    const res = err.res;
    if (res && res.body && res.body.status) {
      throw new Error(res.body.message || 'Error not defined by the server');
    } else {
      throw new Error('Could not reach server?');
    }
  }
}
