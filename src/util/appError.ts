import logger from './logger/logger';
import { buildResponse } from './utility';

export class AppError extends Error {
  statusCode: number;
  status: string;
  transactionSession: any;

  constructor(message: string, statusCode: number, session?: any) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'FAILURE' : 'ERROR';

    if (session) {
      this.closeSession(session);
    }

    if (`${statusCode}`.startsWith('5')) {
      Error.captureStackTrace(this, this.constructor);
    }
    // return;
  }

  async closeSession(session) {
    await session.abortTransaction();
    session.endSession();
  }
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please login again', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired. Please login again', 401);

const sendErrorDev = (err, res) => {
  return buildResponse(res, err.statusCode, {
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  logger.log('error', `internal server error: ${err}`);

  if (err.isStaging) {
    return buildResponse(res, err.statusCode, {
      status: err.status,
      message: err.message,
    });
  } else {
    return buildResponse(res, err.statusCode, {
      status: 'error',
      message: 'internal server error, if this persit, please contact support',
    });
  }
};

// NOTE: Do not remove the unused arguments
export const globalErrorHandler = async (err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.isStaging = process.env.NODE_ENV !== 'production';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = err;
    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error._message === 'Validation failed') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export const catchAsyncError = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};