import express from 'express';
import fs from 'fs';
import https from 'https';
import {SocketIO} from './slave/index.es6';
import {NodeIPC} from './master/index.es6';
import config from 'config';
import address from './libs/address.es6';

const allowRemote = config.get('IPC.allowRemote');
const port = config.get('Server.port');
const offset = config.get('Server.portOffset');

const debug = true;
const app = express();
const sio = new SocketIO(debug);
const ipc = new NodeIPC(allowRemote, {appspace: port, debug: true});

const ssl = {
  key: fs.readFileSync(config.get('Server.sslKey')),
  cert: fs.readFileSync(config.get('Server.sslCert')),
  ca: fs.readFileSync(config.get('Server.sslCa')),
  rejectUnauthorized: config.get('Server.httpsRejectUnauthorized')
};

const server = https.createServer(ssl, app);

sio.attach(server);

ipc.on('add-token', (origin, data) => sio.accept(origin, data.token));
ipc.on('remove-token', (origin, data) => sio.reject(origin, data.token));
ipc.on('broadcast', (origin, data) => sio.broadcast(origin, data.channel, data.data));
ipc.on('emit', (origin, data) => sio.emit(origin, data.token, data.channel, data.id, data.data, data.awk));
ipc.on('get-server-address', origin => address(server).then(addr => ipc.emit(origin, 'server-address', addr)));

sio.on('client-received', (origin, data) => ipc.emit(origin, 'client-received', data));
sio.on('client-disconnected', (origin, data) => ipc.emit(origin, 'client-disconnected', data));
sio.on('token-added', (origin, data) => ipc.emit(origin, 'token-added', data));
sio.on('token-removed', (origin, data) => ipc.emit(origin, 'token-removed', data));

ipc.listen(port,
           () => server.listen(port + offset,
                               () => console.log(`Listening on ${port} and ${port + offset}`)));
