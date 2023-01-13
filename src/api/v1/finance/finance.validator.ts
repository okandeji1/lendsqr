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
  sender: joi.string().required(),
  beneficiary: joi.string().required(),
  narration: joi.string(),
  amount: joi.number().integer().positive().required(), // comm
});

export const withdrawFundSchema = joi.object({
  amount: joi.number().integer().positive().required(),
  sender: joi.string().required(),
  reason: joi.string().required(),
  bankDetails: joi.object({
    bankCode: joi.string().required(),
    accountNumber: joi.string().required(),
    accountName: joi.string().required(),
  }),
});

export const FundUserSchema = joi.object({
  username: joi.string().required(),
  narration: joi.string(),
  amount: joi.number().integer().positive().required(), // comm
});
