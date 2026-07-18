import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
    pricePaid: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// MANDATORY: prevents duplicate purchases at the database level,
// even under concurrent requests. See unlock.service.js for how
// this is used as the actual concurrency guarantee.
purchaseSchema.index({ buyerId: 1, mediaId: 1 }, { unique: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;