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
      select: false, // never returned by default on queries
    },
    coinBalance: {
      type: Number,
      default: () => env.defaultWalletBalance,
      min: 0,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Hash the password only when it's new or being changed —
// avoids re-hashing an already-hashed password on unrelated updates.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// Instance method to compare a plaintext candidate password
// against the stored hash during login.
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Explicitly shape what gets sent back in API responses —
// this is a second safety net on top of `select: false` above,
// in case a query ever explicitly includes the password field.
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