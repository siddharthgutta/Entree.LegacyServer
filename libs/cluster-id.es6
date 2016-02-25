import cluster from 'cluster';

let id = '00';

if (cluster.isWorker) {
  id += cluster.worker.id;
}

export default id;
