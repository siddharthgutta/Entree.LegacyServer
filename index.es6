import express from 'express';
import fs from 'fs';
import https from 'https';
import config from 'config';
import PubSub from './pubsub.es6';
import TwilioRouter from './routers/twilio.es6';

const port = config.get('Server.port');
const offset = config.get('Server.portOffset');

const ssl = {
  key: fs.readFileSync(config.get('Server.sslKey')),
  cert: fs.readFileSync(config.get('Server.sslCert')),
  ca: fs.readFileSync(config.get('Server.sslCa')),
  rejectUnauthorized: config.get('Server.httpsRejectUnauthorized')
};

const app = express();
const server = https.createServer(ssl, app);

app.use('/twilio', TwilioRouter);

PubSub.listen(server, port, port + offset, () => {
  console.log(`Listening on ${port} and ${port + offset}`);
});
