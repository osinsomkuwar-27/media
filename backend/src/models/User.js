import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import env from '../config/env.js';

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    coinBalance: {
      type: Number,
      default: () => env.defaultWalletBalance,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose 9: async middleware should just be an async function that
// returns/throws — no callback-style `next` parameter needed. Mongoose
// awaits the returned promise; throwing inside aborts the save.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    coinBalance: this.coinBalance,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;