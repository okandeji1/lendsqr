import axios from 'axios';
import { v4 } from 'uuid';
import { AppError, catchAsyncError } from '../../../util/appError';
import { generateId } from '../../../@core/universal';
import { User } from '../../../database/models/user.model';
import { UserTransaction } from '../../../database/models/transaction.model';

// @ts-ignore
const config: any = process.env;

const { PAYSTACK_SECRET } = config;

export const depositWalletWithPaystack = catchAsyncError(async (req, res) => {
  // NOTE: This endpoint can be handled in the frontend but for test purposes
  const obj = req.body;

  const reference = generateId({ suffix: 'BT' });

  const KEY = PAYSTACK_SECRET;

  const { data: responseData } = await axios({
    method: 'post',
    url: 'https://api.paystack.co/transaction/initialize',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    data: {
      ...obj,
      metadata: {
        custom_fields: [{ username: obj.username }, { name: obj.name }],
      },
      callback_url: obj?.callbackUrl,
      amount: obj.amount * 100,
      reference,
    },
  });

  if (responseData.status) {
    return res.status(200).json({
      status: true,
      message: 'operation executed successfully',
      data: responseData.data,
    });
  }

  return res.status(200).json({
    status: false,
    message: 'funding of wallet failed',
    data: responseData,
    reference,
  });
});

export const verifyWalletWithPaystack = catchAsyncError(async (req, res) => {
  const obj = req.query;

  const transaction = await UserTransaction.query().findOne({ reference: obj.reference });

  if (transaction) {
    throw new AppError(`The transaction with reference '${obj.reference}' already registered`, 400);
  }

  const KEY: any = PAYSTACK_SECRET;

  let { data: responseData } = await axios({
    method: 'get',
    url: `https://api.paystack.co/transaction/verify/${obj.reference}`,
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
  });

  // HACK: All Paystack test transaction reference always returning 'abandoned'
  if (KEY.toLowerCase().includes('test')) {
    responseData = {
      ...responseData,
      data: {
        ...responseData.data,
        status: 'success',
      },
    };
  }

  // NOTE: check if the transsport itself is successful not just the request, paystack is returning status: 'abandoned' for all request in test mode,
  // uncoment next line if you find out that status: 'success' in live mode
  if (responseData.status && responseData.data.status === 'success') {
    obj.username = responseData.data.metadata.custom_fields[0].username;

    // Start transaction
    const returnValue = await User.transaction(async (trx) => {
      const user: any = await User.query(trx).findOne({ username: obj.username });

      if (!user) {
        throw new AppError(`User with username ${obj.username} not found`, 404);
      }

      const amount = responseData.data.amount / 100;
      if (amount < 0 && user.balance + amount < 0) {
        throw new AppError('The user does not have enough balance.', 400);
      }

      await user.$query(trx).increment('balance', amount);

      const updatedUser: any = await User.query(trx).findOne({ username: obj.username });

      const newUserTransaction: any = await UserTransaction.query(trx).insert({
        uuid: v4(),
        reference: obj.reference,
        amount: responseData.data.amount / 100,
        source: 'bank',
        destination: 'wallet',
        status: 'SUCCESS',
        channel: 'web',
        paymentGateway: 'PAYSTACK',
        narration:
          obj.narration ||
          `Bank deposit payment of ${responseData.data.amount / 100} to fund '${
            updatedUser.username
          }' wallet`,
        currency: 'NGN',
        beneficiary: updatedUser.username,
        beneficiaryHistory: {
          balanceBefore: updatedUser.balance - responseData.data.amount / 100,
          amount: responseData.data.amount / 100,
          balanceAfter: updatedUser.balance,
        },

        type: 'DEPOSIT',
      });

      if (!newUserTransaction) {
        throw new AppError('internal server error', 500);
      }

      newUserTransaction;
      console.log({ newUserTransaction });
    });

    returnValue;

    return res.status(200).json({
      status: true,
      message: 'wallet funded successfully',
      data: {
        // username: updatedUser.username,
        reference: obj.reference,
        // history: newUserTransaction.beneficiaryHistory,
      },
    });
  }

  return res.status(200).json({
    status: false,
    message: 'funding of wallet failed',
    data: responseData,
  });
});

// export const fundAccount = catchAsyncError(async (req, res) => {
//   const tenantConnection = getConnection(req.query.tenant);
//   const { models: tenantModels } = tenantConnection;
//   const session = await tenantConnection.startSession();
//   session.startTransaction();
//   const opts = { session, new: true };

//   const obj = req.body;

//   if (req.user.role === 'tenant') {
//     throw new AppError('user not allowed to perform this operation', 403, session);
//   }

//   // Get default cvc value
//   const settings = await tenantModels.Configuration.findOne({}).lean();

//   //   Calc amount of cvc bought
//   const cvcAmount = obj.amount / settings.cvcValue;

//   // add fund to tenant
//   const updatedTenant: any = await tenantModels.User.findOneAndUpdate(
//     { username: tenantConnection.name },
//     {
//       $inc: {
//         'wallet.balance': obj.amount,
//         'wallet.cvc': -cvcAmount,
//       },
//     },
//     opts,
//   );

//   if (!updatedTenant) {
//     throw new AppError('user not found, tenant does not exist', 404, session);
//   }

//   if (updatedTenant.wallet.cvc < 0) {
//     // insufficient cvc
//     await notification({
//       sender: 'System',
//       title: 'Generate CVC',
//       typeOfRecipients: tenantConnection.name,
//       text: 'Generate cvc so as to fund users',
//       priority: 'HIGH',
//     });

//     throw new AppError('Unable to process at this moment', 403, session);
//   }

//   // Update balance and cvc
//   const updatedUser = await tenantModels.User.findOneAndUpdate(
//     { username: obj.username },
//     {
//       $inc: {
//         'wallet.balance': -obj.amount,
//         'wallet.cvc': cvcAmount,
//       },
//     },
//     opts,
//   ).lean();

//   if (!updatedUser) {
//     throw new AppError('user not found', 404, session);
//   }

//   // Check for user balance is not negative after deduction
//   if (updatedUser.wallet.balance < 0) {
//     throw new AppError('Insufficient fund', 403, session);
//   }

//   const reference = generateId({ suffix: 'CP ' });
//   // log user transaction
//   await tenantModels.UserTransaction.create({
//     reference,
//     amount: obj.amount,
//     source: 'wallet',
//     destination: 'cvc wallet',
//     status: 'SUCCESS',
//     channel: 'app',
//     narration: `Coin worth of ${obj.amount} purchased to credit '${updatedUser.username}' coin wallet`,
//     currency: 'NGN',
//     sender: updatedUser.username,
//     beneficiary: updatedTenant.username,
//     performedBy: updatedUser.username,
//     senderHistory: {
//       balanceBefore: updatedUser.wallet.balance + obj.amount,
//       amount: obj.amount,
//       balanceAfter: updatedUser.wallet.balance,
//     },
//     beneficiaryHistory: {
//       balanceBefore: updatedTenant.wallet.balance - obj.amount,
//       amount: obj.amount,
//       balanceAfter: updatedTenant.wallet.balance,
//     },

//     type: 'BUY_COIN',
//   });

//   //FIXME: commit session
//   await session.commitTransaction();
//   session.endSession();

//   return res.status(200).json({
//     status: true,
//     message: 'cvc bought successfully',
//     data: updatedUser,
//   });
// });
