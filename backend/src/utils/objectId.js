import mongoose from 'mongoose';
import AppError from './AppError.js';

export function validateObjectId(id, label = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400, 'INVALID_ID');
  }
}