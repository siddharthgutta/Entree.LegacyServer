import express from 'express'
import path from 'path'
import favicon from 'serve-favicon'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import _ from 'underscore'
import http from 'http'
import sio from './message/sio'
import BasicRouter from './routes/basic'
import NotifyRouter from './routes/notify'
import * as BranchOff from 'branch-off'

const app = express();
const server = http.createServer(app);

sio.attach(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/postreceive', BranchOff.getRouter());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', BasicRouter);
app.use('/notify', NotifyRouter);

export const expressApp = app;

export default server;