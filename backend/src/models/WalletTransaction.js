import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['INITIAL_CREDIT', 'MEDIA_UNLOCK', 'MEDIA_SALE'],
      required: true,
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    relatedMediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
    relatedPurchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', default: null },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
export default WalletTransaction;