import express from 'express'
// Module for handling/transforming file paths
import path from 'path'
// Middleware for serving a favicon
import favicon from 'serve-favicon'
// HTTP request logger middleware
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
// Functional Programming JS Helper Library 
import _ from 'underscore'
import http from 'http'
// Socket-io (WebSockets)
import sio from './message/sio'

// Imports standard/websocket routers
import BasicRouter from './routes/basic'
import NotifyRouter from './routes/notify'
// ???
import * as BranchOff from 'branch-off'


// Server Creation
const app = express();
const server = http.createServer(app);

// Attaches server to socket.io instance
sio.attach(server);

// Points app to location of the views
app.set('views', path.join(__dirname, 'views'));
// Sets the view engine to jade
app.set('view engine', 'jade');
// ???
app.use('/postreceive', BranchOff.getRouter());

/* Morgan Logger Settings
Concise output colored by response status for development use. 
The :status token will be colored red for server error codes, 
yellow for client error codes, cyan for redirection codes, and 
uncolored for all other codes.
*/
app.use(logger('dev'));
// Sets app to use middleware that only parses json
app.use(bodyParser.json());
// Body object from parsed data can have values of strings/arrays
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
// Points app to public directory for static files
app.use(express.static(path.join(__dirname, 'public')));

// Sets up specific routes
app.use('/', BasicRouter);
app.use('/notify', NotifyRouter);

export const expressApp = app;
export default server;