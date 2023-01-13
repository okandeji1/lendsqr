import express from 'express';

import * as transactionController from './transaction.controller';
import { getTransactionsSchema } from './transaction.validator';
import { inputValidator, isAuthenticated } from '../../../util/middleware';

export const transactionRouter = express.Router();

transactionRouter.get(
  '/',
  inputValidator({ query: getTransactionsSchema }),
  isAuthenticated,
  transactionController.getTransactions,
);
