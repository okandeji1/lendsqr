import axios from '../../../util/axios';
import { v4 } from 'uuid';
import { AppError, catchAsyncError } from '../../../util/appError';
import { disbursement, generateId } from '../../../@core/universal';
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
    let newUserTransaction: any;
    let updatedUser: any;

    // Start transaction
    await User.transaction(async (trx) => {
      const user: any = await User.query(trx).findOne({ username: obj.username });

      if (!user) {
        throw new AppError(`User with username ${obj.username} not found`, 404);
      }

      const amount = responseData.data.amount / 100;
      if (amount < 0 && user.balance + amount < 0) {
        throw new AppError('The user does not have enough balance.', 400);
      }

      await user.$query(trx).increment('balance', amount);

      updatedUser = await User.query(trx).findOne({ username: obj.username });

      newUserTransaction = await UserTransaction.query(trx).insert({
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

        type: 'FUND_WALLET',
      });
    });

    return res.status(200).json({
      status: true,
      message: 'wallet funded successfully',
      data: {
        username: updatedUser.username,
        reference: obj.reference,
        history: newUserTransaction.beneficiaryHistory,
      },
    });
  }

  return res.status(200).json({
    status: false,
    message: 'funding of wallet failed',
    data: responseData,
  });
});

export const transferFund = catchAsyncError(async (req, res) => {
  const obj = req.body;

  // find user (the sender)
  const checkSender: any = await User.query().findOne({ username: obj.sender });

  if (!checkSender) {
    throw new AppError(`Sender with username ${obj.sender} not found`, 404);
  }

  // find user (the beneficiary)
  const checkBeneficiary: any = await User.query().findOne({ username: obj.beneficiary });

  if (!checkBeneficiary) {
    throw new AppError(`Beneficiary with username ${obj.beneficiary} not found`, 404);
  }

  // Initials
  let sender: any;
  let beneficiary: any;
  let newUserTransaction: any;
  const reference = generateId({ suffix: 'WT' });

  // Start transaction
  await User.transaction(async (trx) => {
    // Deduct fund from user (Sender)
    await checkSender.$query(trx).decrement('balance', obj.amount);

    // Get the sender (Updated data)
    sender = await User.query(trx).findOne({ username: obj.sender });

    // Check sender balance (Must not be -ve)
    if (sender.balance < 0) {
      throw new AppError('Insufficient fund', 402);
    }

    // Proceed to add fund to beneficiary (Binding)
    await checkBeneficiary.$query(trx).increment('balance', obj.amount);
    // Get beneficiary data
    beneficiary = await User.query(trx).findOne({ username: obj.beneficiary });

    // Log transaction
    newUserTransaction = await UserTransaction.query(trx).insert({
      uuid: v4(),
      reference,
      amount: obj.amount,
      channel: 'web',
      source: 'wallet',
      destination: 'wallet',
      status: 'SUCCESS',
      narration:
        obj.narration ||
        `transfer of ${obj.amount} fund from user '${obj.sender}' to user '${obj.beneficiary}'`,
      currency: 'NGN',
      sender: obj.sender,
      beneficiary: obj.beneficiary,
      senderHistory: {
        balanceBefore: sender.balance + obj.amount,
        amount: obj.amount,
        balanceAfter: sender.balance,
      },
      // NOTE: history of the beneficiary, the beneficiary should be able to get personalized history when transaction is viewed from his end
      // to display personalized transaction according to user in the frontend,
      // check if user.mobile === transaction.beneficiary, if true, user is the beneficiary of the transaction and beneficiaryHistory can be display instead of history
      beneficiaryHistory: {
        balanceBefore: beneficiary.balance - obj.amount,
        amount: obj.amount,
        balanceAfter: beneficiary.balance,
      },
      type: 'WALLET_TRANSFER',
    });
  });

  return res.status(200).json({
    status: true,
    message: 'fund transfered successfully',
    data: {
      sender: sender.username,
      beneficiary: beneficiary.username,
      reference,
      amount: obj.amount,
      history: newUserTransaction.history,
      wallet: sender.balance,
    },
  });
});

export const withdrawFund = catchAsyncError(async (req, res) => {
  const obj = req.body;

  // Start transaction
  const trx = await User.startTransaction();
  const sender: any = await User.query(trx).findOne({ username: obj.sender });

  // Remove fund from wallet
  await sender.$query(trx).decrement('balance', obj.amount);

  const updatedUser: any = await User.query(trx).findOne({ username: obj.sender });

  if (updatedUser.balance < 0) {
    throw new AppError('Insufficient fund', 402, trx);
  }

  // Proceed to make withdrawal
  const disburse = await disbursement({
    username: req?.use?.username,
    bankDetails: obj.bankDetails,
    trx,
  });

  if (!disburse.status) {
    throw new AppError(disburse.message, 402, trx);
  }

  const reference = disburse.reference;

  await UserTransaction.query(trx).insert({
    reference,
    source: 'bank',
    amount: obj.amount,
    destination: 'bank',
    status: 'SUCCESS',
    narration: `${obj.reason} for ${reference}`,
    currency: 'NGN',
    sender: obj.sender,
    senderHistory: {
      balanceBefore: Number(updatedUser.balance) + obj.amount,
      amount: obj.amount,
      balanceAfter: Number(updatedUser.balance),
    },
    type: 'WITHDRAW_WALLET',
  });

  // Commit transaction
  trx.commit();
  return res.status(200).json({
    status: true,
    data: {
      sender: obj.sender,
      reference,
      amount: obj.amount,
      beneficiary: obj.bankDetails,
    },
    message: 'Withdrawal successfully placed',
  });
});
