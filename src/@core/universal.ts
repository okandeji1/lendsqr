import { nanoid } from 'nanoid';
import { AppError } from '../util/appError';
import axios from '../util/axios';
import logger from '../util/logger/logger';

const config: any = process.env;

const { PAYSTACK_SECRET } = config;

export const generateId = (options) => {
  return options.suffix ? `${options.suffix}-${nanoid(options.length)}` : nanoid(options.length);
};

export const disbursement = async (options: any): Promise<any> => {
  const KEY = PAYSTACK_SECRET;
  let reference: any;

  try {
    // Paystack
    const { data: responseData } = await axios({
      method: 'get',
      url: `https://api.paystack.co/bank/resolve?account_number=${options.bankDetails.accountNumber}&bank_code=${options.bankDetails.bankCode}`,
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!responseData.status) {
      throw new AppError(responseData.message, 406, options.trx);
    }

    // Check account against response account
    const accountName = options.bankDetails.accountName.toLowerCase();
    const accName = responseData.data.account_name.toLowerCase();

    if (accName !== accountName) {
      throw new AppError('Sorry! Please provide a valid bank details', 400, options.trx);
    }

    // Create a transfer recipient/
    const params = JSON.stringify({
      type: 'nuban',
      name: options.username,
      account_number: responseData.data.account_number,
      bank_code: options.bankDetails.bankCode,
      currency: 'NGN',
    });

    const { data: createTransferRecipient } = await axios({
      method: 'post',
      url: 'https://api.paystack.co/transferrecipient',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      data: params,
    });

    // return error? error
    if (!createTransferRecipient.status) {
      throw new AppError(createTransferRecipient.message, 402, options.trx);
    }

    // Initiate a transfer
    const data = JSON.stringify({
      source: 'balance',
      amount: options.amount * 100,
      recipient: createTransferRecipient.data.recipient_code,
      reason: options?.reason,
    });

    const { data: initTransfer } = await axios({
      method: 'post',
      url: 'https://api.paystack.co/transfer',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      data: data,
    });

    // Check again
    if (!initTransfer) {
      throw new AppError(initTransfer.message, 402, options.trx);
    }

    return {
      status: true,
      reference,
    };
  } catch (error: any) {
    logger.log('info', `request failed. Error: ${error.message}`);
    return {
      status: false,
      message: error.message,
    };
  }
};
