import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';

export async function getWalletBalance(userId) {
  const user = await User.findById(userId);
  return { coinBalance: user.coinBalance };
}

export async function getTransactionHistory(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    WalletTransaction.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    WalletTransaction.countDocuments({ userId }),
  ]);

  return {
    transactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}