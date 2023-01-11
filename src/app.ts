import express, { Application } from 'express';
import compression from 'compression'; // compresses requests
import path from 'path';
import cors from 'cors';
import { knex } from 'knex';
import * as dotenv from 'dotenv';
dotenv.config();
import { AppError, globalErrorHandler } from './util/appError';
import * as knexConfig from '../knexfile';

import logger from './util/logger/logger';
// HACK: to get app root
process.env.APP_ROOT = path.join(__dirname, '../');

// set up error handler
process.on('uncaughtException', (e: any) => {
  logger.log('error', e.stack);
  process.exit(1);
});

process.on('unhandledRejection', (e: any) => {
  logger.log('error', e.stack);
  process.exit(1);
});

// Create Express server
const app: Application = express();

// Database connection
knex(knexConfig);
// Testing connection
try {
  const result = knex('users').select().limit(1);
  logger.log('info', `Connection established: ${result}`);
} catch (err) {
  logger.log('error', `Database connection error: ${err}`);
  throw err;
}

// Express configuration
app.set('port', Number(process.env.APP_PORT) || 8088);
app.use(express.static(path.join('public'), { maxAge: 31557600000 }));

app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(compression());
app.use(cors());
app.use(express.json());

app.all('*', (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;