import { catchAsyncError } from '../../../util/appError';
import { UserTransaction } from '../../../database/models/transaction.model';

export const getTransactions = catchAsyncError(async (req, res) => {
  const obj = req.query;

  const { limit, page } = req.query;

  // NOTE: transaction is a 2-way record which means the sender gets a personalized transaction record and beneciary get also.
  // NOTE: Just like when you send money to your friends bank account from yours, You get debit alert personalized for you and your
  // friend get credit alert personalized for him as well.
  // NOTE: this logic is to get transactions belonging to a user whether credit or debit.

  let query: any = {};
  let objKey: any;
  let transactions: any;

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'limit' || key === 'page') {
      continue;
    }
    objKey = key;
    query = { ...query, [key]: value };
  }

  if (objKey && query[objKey]) {
    switch (objKey) {
      case 'username':
        // Get sender or beneficiary using username query parameter
        transactions = await UserTransaction.query()
          .orWhere('sender', obj[objKey])
          .orWhere('beneficiary', obj[objKey])
          .offset((page - 1) * limit)
          .limit(limit)
          .orderBy('created_at', 'desc');
        break;
      default:
        // Get with reference and other query parameters
        transactions = await UserTransaction.query()
          .where(objKey, obj[objKey])
          .offset((page - 1) * limit)
          .limit(limit)
          .orderBy('created_at', 'desc');
        break;
    }

    return res.status(200).json({
      status: true,
      message: 'found transaction(s)',
      data: transactions,
      meta: {
        total: transactions.length,
        skipped: page * limit,
        perPage: limit,
        page: page,
        pageCount: Math.ceil(transactions.length / limit),
      },
    });
  }

  // Get all transactions
  transactions = await UserTransaction.query()
    .offset((page - 1) * limit)
    .limit(limit)
    .orderBy('created_at', 'desc');

  return res.status(200).json({
    status: true,
    message: 'transaction(s) found',
    data: transactions,
    meta: {
      total: transactions.length,
      skipped: page * limit,
      perPage: limit,
      page: page,
      pageCount: Math.ceil(transactions.length / limit),
    },
  });
});
