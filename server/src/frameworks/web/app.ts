import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from '../../frameworks/web/routes/index.js';
import { env } from '../config/env.js';
import { errorHandler } from '../../frameworks/web/middlewares/error.middleware.js';

export const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));

  app.use('/api/v1', routes);
  app.get('/health', (req, res) => res.json({ ok: true }));
  app.use(errorHandler);
  return app;
};
