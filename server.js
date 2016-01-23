import express from 'express'
import path from 'path'                     // module for handling/transforming file paths
import favicon from 'serve-favicon'         // middleware for serving a favicon
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import _ from 'underscore'                  // functional programming library
import http from 'http'
import sio from './message/sio'             // socket-io (websockets)
import BasicRouter from './routes/basic'    // imports standard/websocket routers
import NotifyRouter from './routes/notify'
import ApiRouter from './routes/api'
import TwilioRouter from './routes/twilio'
import sequelize from './models'            // mysql orm

const app = express();                            // server creation
const server = http.createServer(app);

sio.attach(server);                               // attaches server to socket.io instance

app.set('sequelize', sequelize);
app.set('views', path.join(__dirname, 'views'));  // points app to location of the views
app.set('view engine', 'jade');                   // sets the view engine to jade
app.use('/postreceive', BranchOff.getRouter());   // connects webhook to the postreceive endpoint
app.use('/scribe', console.viewer());

/**
 * Morgan Logger Settings
 * Concise output colored by response status for development use.
 * The :status token will be colored red for server error codes,
 * yellow for client error codes, cyan for redirection codes, and
 * uncolored for all other codes.
 */
app.use(console.middleware('express'));
app.use(bodyParser.urlencoded({extended: false}));       // body object from parsed data can have values of strings/arrays
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
