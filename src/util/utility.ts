import jwt from 'jsonwebtoken';
import joi from '@hapi/joi';
import { AppError } from './appError';
const JWT_SECRET: any = process.env.JWT_SECRET;

export const makeToken = (user, lifespan = '1d') =>
  jwt.sign({ user }, JWT_SECRET, {
    expiresIn: lifespan,
  });

export const generateTokens = (user) => {
  const accessToken = makeToken(user);
  const refreshToken = makeToken(user, '30d');
  return { accessToken, refreshToken };
};

export const verifyToken = (accessToken, checkExpiry = true) => {
  // @ts-ignore
  const { exp, user } = jwt.verify(accessToken, JWT_SECRET);

  if (checkExpiry) {
    // convert exp to milliseconds by multiplying by 1000
    if (+new Date() > exp * 1000) {
      throw new AppError('token expired! Please re-login', 401);
    }
  }
  return user;
};

export const buildResponse = (response, statusCode, data, preTag = 'Response') => {
  return response.format({
    'application/json': () => {
      response.status(statusCode).json(data);
    },
    default: () => {
      // log the request and respond with 406
      response.status(406).send('Not Acceptable');
    },
    preTag,
  });
};

export const includesSome = (arr, values) => values.some((v) => arr.includes(v));

export const paginationSchema = () => ({
  query: {
    limit: joi.number().min(0).max(1000).default(10),
    page: joi.number().min(1).default(1),
  },
});
