import config from 'config';
import cluster from 'cluster';
import fetch from './fetch.es6';
import {format} from 'url';

const address = config.get('Server');
const hostnames = config.get('Server.hostnames');
const mode = config.get('Mode');
const branch = config.get('AppBranch');
const isInsideTest = config.get('IsTest');

let clusterId = 'X';

if (cluster.isWorker) {
  clusterId = cluster.worker.id;
}

export const cid = clusterId; // cluster id
export const pid = config.get('NodeEnv') + config.get('Mode') + config.get('AppId'); // process level id (virtual)
export const uid = process.pid + config.get('Mode') + cid + config.get('AppBranch'); // unique id


/**
 * @returns {boolean} true if system is running locally
 */
export function isLocal() {
  return mode === 'local-stage' || mode === 'local-release';
}


/**
 * @returns {boolean} true if system is running on remote
 */
export function isRemote() {
  return mode === 'stage' || mode === 'release';
}


/**
 * @returns {boolean} true if system is being staged
 */
export function isStaging() {
  return mode === 'local-stage' || mode === 'stage';
}


/**
 * @returns {boolean} true if system is released (not staging)
 */
export function isRelease() {
  return mode === 'local-release' || mode === 'release';
}


/**
 * @returns {boolean} true if it is the master branch
 */
export function isMaster() {
  return branch === 'master';
}


/**
 * @returns {boolean} true if system is running in production on remote server
 */
export function isProduction() {
  return isRelease() && isRemote() && isMaster();
}


export function isTest() {
  return isInsideTest;
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

export async function resolveAddress() {
  return Object.assign({}, address, {hostname: await hostname()});
}
