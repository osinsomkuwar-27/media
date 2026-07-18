import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';

export async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });

  if (existing) {
    throw new AppError('Email already in use', 409, 'DUPLICATE_EMAIL');
  }

  const user = await User.create({ name, email, password });

  const token = signToken(user._id.toString());

  return { user: user.toSafeObject(), token };
}

export async function loginUser({ email, password }) {
  // password has `select: false` on the schema, so we explicitly
  // request it here since we need to compare it.
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