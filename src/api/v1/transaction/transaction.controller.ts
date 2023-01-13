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
  for (const [key, value] of Object.entries(obj)) {
    if (
      key === 'tenant' ||
      key === 'limit' ||
      key === 'page' ||
      key === 'startDate' ||
      key === 'endDate'
    ) {
      continue;
    }

    if (key === 'username') {
      query = { ...query, $or: [{ sender: value }, { beneficiary: value }] };
      continue;
    }

    if (key === 'type' || key === 'status') {
      // @ts-ignore
      const items = value.split(',');
      let $or: any = [];
      for (const item of items) {
        $or = [...$or, { [key]: item }];
      }
      query.$and = query.$and || [];
      query.$and.push({ $or });

      continue;
    }

    query = { ...query, [key]: value };
  }

  if (obj.startDate && obj.endDate) {
    let startDate: any = new Date(obj.startDate).setHours(0, 0, 0);
    let endDate: any = new Date(obj.endDate).setHours(23, 59, 59);

    startDate = new Date(startDate);
    endDate = new Date(endDate);
    query = {
      ...query,
      createdAt: { $gte: startDate, $lte: endDate },
    };
  }

  const transactions: any = await UserTransaction.query()
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
