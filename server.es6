import express from 'express';
import path from 'path';                     // module for handling/transforming file paths
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import http from 'http';
import sio from './message/sio';             // socket-io (websockets)
import BasicRouter from './routes/basic';    // imports standard/websocket routers
import NotifyRouter from './routes/notify';
import ApiRouter from './routes/api';
import TwilioRouter from './routes/twilio';

const app = express();                            // server creation
const server = http.createServer(app);

sio.attach(server);                                 // attaches server to socket.io instance

app.set('views', path.join(__dirname, 'views'));  // points app to location of the views
app.set('view engine', 'jade');                   // sets the view engine to jade

// console access
app.use(console.middleware('express'));
app.use('/scribe', console.viewer());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());                              // sets app to use middleware that only parses json
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // points app to public directory for static files

// sets up specific routes
app.use('/', BasicRouter);
app.use('/notify', NotifyRouter);
app.use('/api', ApiRouter);
app.use('/twilio', TwilioRouter);

export const expressApp = app;
export default server;
