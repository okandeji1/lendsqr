// /* eslint-disable import/prefer-default-export */
import joi from '@hapi/joi';

export const getTransactionsSchema = joi.object({
  username: joi.string(),
  reference: joi.string(),
  status: joi.string(),
  type: joi.string(),
  startDate: joi.date(),
  endDate: joi.date(),
  limit: joi.number().min(0).max(1000).default(10),
  page: joi.number().min(1).default(1),
});
