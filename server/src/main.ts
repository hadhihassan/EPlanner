import mongoose from 'mongoose';
import http from 'http';
import { createApp } from './frameworks/web/app.js';
import { initSockets } from './frameworks/sockets/index.js';
import { env } from './frameworks/config/env.js';
import { scheduleDailyDigest } from './adapters/repositories/scheduler.repo.js';
import './frameworks/jobs/worker.js';

const app = createApp();
const server = http.createServer(app);
initSockets(server);

mongoose
  .connect(env.MONGO_URI)
  .then(async () => {
    console.log('Mongo connected');
    
    // Schedule daily digest job
    // await scheduleDailyDigest();
    // console.log('📅 Daily digest job scheduled');
    
    server.listen(env.PORT, () => console.log(`Server running ${env.PORT}`));
  }).catch(err => {
    console.error('mongo error', err);
    process.exit(1);
  });
