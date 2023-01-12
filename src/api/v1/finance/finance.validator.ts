// /* eslint-disable import/prefer-default-export */
import joi from '@hapi/joi';

// || || () () | PROVIDER SECTION  | () () || || \\ START

export const depositWalletWithPaystackSchema = joi.object({
  amount: joi.number().integer().positive().required(),
  email: joi.string().required(),
  username: joi.string().required(),
  currency: joi.string(),
  callbackUrl: joi.string().required(),
  name: joi.string(),
});

export const verifyWalletWithPaystackSchema = joi.object({
  reference: joi.string().required(),
});

export const TransferFundSchema = joi.object({
  username: joi.string().required(),
  amount: joi.number().integer().positive().required(),
});
