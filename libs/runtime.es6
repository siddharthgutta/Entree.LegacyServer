import config from 'config';
import cluster from 'cluster';
import fetch from './fetch.es6';
import {format} from 'url';

const address = config.get('Server');
const hostnames = config.get('Server.hostnames');
const mode = config.get('Mode');
const env = config.get('NodeEnv');
const branch = config.get('AppBranch');

let clusterId = 'X';

if (cluster.isWorker) {
  clusterId = cluster.worker.id;
}

export const cid = clusterId; // cluster id
export const pid = config.get('NodeEnv') + config.get('Mode') + config.get('AppId'); // process level id (virtual)
export const uid = process.pid + config.get('Mode') + cid + config.get('AppBranch'); // unique id

export function isProduction() {
  return mode === 'release' && env === 'production' && branch === 'master';
}

let _hostname;
export async function hostname() {
  if (_hostname) {
    return _hostname;
  }

  for (const hn of hostnames) {
    const url = `${format({...address, hostname: hn})}/appinfo`;

    try {
      const {body: {pid: _pid}} = await fetch(url, {method: 'post'});

      if (_pid === pid) {
        _hostname = hn;
        return _hostname;
      }

      await console.log(`${url} mismatch`);
    } catch (e) {
      // ignore;
    }
  }

  throw new Error('Could not resolve hostname!');
}
