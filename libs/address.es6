import externalIP from 'external-ip';
import config from 'config';
import Promise from 'bluebird';

const isLocal = config.get('Mode') === 'manual';

let _address;

export default function address(server = {}, protocol = 'https') {
  if (_address) {
    return _address;
  }

  _address = new Promise(resolve => {
    const defAddress = typeof server.address === 'function' ? server.address() : server; // easy work around

    if (isLocal) {
      return resolve({...defAddress, hostname: 'localhost', protocol}); // default https
    }

    // TODO cache this result
    externalIP()((err, hostname) => {
      if (err) throw err;
      resolve({...defAddress, hostname, protocol});
    });
  }).catch(err => {
    // FIXME serious failure
    console.error(err).then(() => process.exit(1));
  });

  return _address;
}
