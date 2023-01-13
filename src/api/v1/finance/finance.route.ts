import express from 'express';

import * as financeController from './finance.controller';

import {
  depositWalletWithPaystackSchema,
  verifyWalletWithPaystackSchema,
  TransferFundSchema,
  withdrawFundSchema,
} from './finance.validator';

import { inputValidator, isAuthenticated } from '../../../util/middleware';

export const financeRouter = express.Router();

financeRouter.post(
  '/wallet/deposit/paystack',
  inputValidator({ body: depositWalletWithPaystackSchema }),
  isAuthenticated,
  financeController.depositWalletWithPaystack,
);

financeRouter.get(
  '/wallet/verify/paystack',
  inputValidator({ query: verifyWalletWithPaystackSchema }),
  isAuthenticated,
  financeController.verifyWalletWithPaystack,
);

financeRouter.post(
  '/wallet/transfer/fund',
  inputValidator({ body: TransferFundSchema }),
  isAuthenticated,
  financeController.transferFund,
);

financeRouter.post(
  '/wallet/withdraw/fund',
  inputValidator({ body: withdrawFundSchema }),
  isAuthenticated,
  financeController.withdrawFund,
);
