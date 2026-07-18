import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import AppError from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';

export async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });

  if (existing) {
    throw new AppError('Email already in use', 409, 'DUPLICATE_EMAIL');
  }

  const user = await User.create({ name, email, password });

  // Best-effort ledger entry for the signup bonus. Not wrapped in a
  // transaction with user creation — if this write fails, the user's
  // coinBalance (set by the schema default) is still correct; only the
  // history entry would be missing. Documented limitation for the MVP.
  try {
    await WalletTransaction.create({
      userId: user._id,
      type: 'INITIAL_CREDIT',
      amount: user.coinBalance,
      balanceAfter: user.coinBalance,
      description: 'Initial signup bonus',
    });
  } catch (err) {
    console.error('Failed to record INITIAL_CREDIT transaction:', err.message);
  }

  const token = signToken(user._id.toString());

  return { user: user.toSafeObject(), token };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const token = signToken(user._id.toString());

  return { user: user.toSafeObject(), token };
}