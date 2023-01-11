/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable consistent-return */
import { AppError } from './appError';
import { paginationSchema, verifyToken } from './utility';

export const inputValidator = (schema: any) => {
  return (req, res, next) => {
    if (schema.paginationQuery) {
      schema.query = schema.query.keys(paginationSchema().query);
      delete schema.paginationQuery;
    }

    for (const [key, item] of Object.entries(schema)) {
      // @ts-ignore
      const { error, value } = item.validate(req[key], { abortEarly: false });

      if (error) {
        return res.status(400).json({
          status: false,
          message: error.message,
          data: 'invalid payload',
        });
      }
      req[key] = value;
    }

    next();
  };
};

export const isAuthenticated = (req, res, next) => {
  let accessToken = req.headers?.authorization || req.query.accessToken;
  if (!accessToken) {
    throw new AppError('access token not found', 401);
  }
  try {
    // stripe auth kind (e.g bearer) from the accesstoken
    const auth = accessToken.split(' ');
    // eslint-disable-next-line prefer-destructuring
    accessToken = auth[1];

    req.user = verifyToken(accessToken);

    next();
  } catch (error: any) {
    if (error.name?.includes('JsonWebTokenError') || error.name?.includes('TokenExpiredError')) {
      throw new AppError(error.message, 401);
    }
    throw new AppError('invalid access token', 401);
  }
};

export const logActivity = async (options: any) => {
  await options.tenantModels.Activity.create(options);
};
