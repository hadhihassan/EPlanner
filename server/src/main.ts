import mongoose from 'mongoose';
import http from 'http';
import { createApp } from './frameworks/web/app.js';
import { initSockets } from './frameworks/sockets/index.js';
import { env } from './frameworks/config/env.js';

const app = createApp();
const server = http.createServer(app);
initSockets(server);

mongoose
  .connect(env.MONGO_URI)
  .then(() => {
    console.log('Mongo connected');
    server.listen(env.PORT, () => console.log(`Server running ${env.PORT}`));
  }).catch(err => {
    console.error('mongo error', err);
    process.exit(1);
  });
