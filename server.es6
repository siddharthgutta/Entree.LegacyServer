import express from 'express';
import path from 'path';                     // module for handling/transforming file paths
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import http from 'http';
import compression from 'compression';
import {socketServer, sioEmitter} from './message/sio.es6';
import {ipcServer, ipcEmitter} from './ipc/server.es6';

const app = express();                            // server creation
const server = http.createServer(app);

socketServer.sio.attach(server);                                 // attaches server to socket.io instance

// Event Emitters Relationships
ipcEmitter.on('token', token => socketServer.addToken(token));
ipcEmitter.on('received', (token, data) => socketServer.emit('received', token, data));
ipcEmitter.on('sent', (token, data) => socketServer.emit('sent', token, data));
sioEmitter.on('disconnect', token => ipcServer.disconnect(token));

app.set('views', path.join(__dirname, 'views'));  // points app to location of the views
app.set('view engine', 'jade');                   // sets the view engine to jade

// compress gzip
app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());                              // sets app to use middleware that only parses json
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // points app to public directory for static files

export const expressApp = app;
export default server;
