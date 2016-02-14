import externalIP from 'external-ip';
import config from 'config';
import Promise from 'bluebird';

const isLocal = config.get('Mode') === 'manual';

let _address;

export default function address(server) {
  if (_address) {
    return _address;
  }

  _address = new Promise(resolve => {
    const defAddress = server.address();

    if (isLocal) {
      return resolve({...defAddress, hostname: 'localhost', protocol: 'https'});
    }

    externalIP()((err, hostname) => {
      if (err) throw err;
      resolve({...defAddress, hostname, protocol: 'https'});
    });
  }).catch(err => {
    console.error(err);

    // serious failure
    process.exit(1);
  });

  return _address;
}
