import { createLogger, transports, format } from 'winston';
import path from 'path';

const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(format.colorize(), format.timestamp(), format.simple()),
      handleExceptions: true,
    }),
    new transports.File({
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      filename: path.join(__dirname, 'logs/combined.log'),
    }),
    new transports.File({
      level: 'warn',
      format: format.combine(format.timestamp(), format.json()),
      filename: path.join(__dirname, 'logs/warn.log'),
    }),

    new transports.File({
      level: 'error',
      format: format.combine(format.timestamp(), format.json()),
      filename: path.join(__dirname, 'logs/errors.log'),
      // handleExceptions: process.env.NODE_ENV === 'production',
      handleExceptions: true,
    }),
  ],
});

export default logger;
