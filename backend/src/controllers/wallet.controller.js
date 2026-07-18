import catchAsync from '../utils/catchAsync.js';
import { getWalletBalance, getTransactionHistory } from '../services/wallet.services.js';

export const getWallet = catchAsync(async (req, res) => {
  const wallet = await getWalletBalance(req.user._id);
  res.status(200).json({ success: true, data: wallet });
});

export const getTransactions = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const result = await getTransactionHistory(req.user._id, { page, limit });

  res.status(200).json({ success: true, data: result });
});