import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

app.all('*', (req, res, next) => {
  res.redirect(`https://${req.hostname}:${req.url}`);
  next();
});

export default server;
