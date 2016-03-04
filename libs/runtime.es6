import config from 'config';
import cluster from 'cluster';
import fetch from './fetch.es6';
import {format} from 'url';

const address = config.get('Server');
const hostnames = config.get('Server.hostnames');

let clusterId = 'X';

if (cluster.isWorker) {
  clusterId = cluster.worker.id;
}

export const cid = clusterId;
export const pid = process.pid + config.get('AppId');
export const uid = cid + pid;

let _hostname;
export async function hostname() {
  if (_hostname) {
    return _hostname;
  }

  for (const hn of hostnames) {
    const url = `${format({...address, hostname: hn})}/appinfo`;

    console.tag('runtime', 'hostname').log('attempting', url);

    try {
      const {body: {pid: _pid}} = await fetch(url, {method: 'post'});

      if (_pid === pid) {
        _hostname = hn;
        return _hostname;
      }
    } catch (e) {
      // ignore;
    }
  }

  throw new Error('Could not resolve hostname!');
}
