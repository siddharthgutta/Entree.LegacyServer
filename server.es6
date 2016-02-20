import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import https from 'https';
import config from 'config';
import compression from 'compression';
import BasicRouter from './routes/basic';
import NotifyRouter from './routes/notify';
import ApiRouter from './routes/api';
import TwilioRouter from './routes/twilio';
import MessengerRouter from './routes/messenger.es6';
import socketServer from './message/socket-server.es6';
import * as fs from 'fs';

const app = express();
const server = https.createServer({
  key: fs.readFileSync(config.get('Server.sslKey')),
  cert: fs.readFileSync(config.get('Server.sslCert')),
  ca: fs.readFileSync(config.get('Server.sslCa')),
  rejectUnauthorized: config.get('Server.httpsRejectUnauthorized')
}, app);

socketServer.connect();

app.set('views', path.join(__dirname, 'views'));  // points app to location of the views
app.set('view engine', 'jade');                   // sets the view engine to jade

// console access
app.use(console.middleware('express'));
app.use('/scribe', console.viewer());

// compress gzip
app.use(compression());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // points app to public directory for static files

// sets up specific routes
app.use('/', BasicRouter);
app.use('/notify', NotifyRouter);
app.use('/api', ApiRouter);
app.use('/twilio', TwilioRouter);
app.use('/messenger', MessengerRouter);

export default server;
