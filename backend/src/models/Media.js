import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    previewFileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    originalFileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    mimeType: { type: String, required: true },
    unlockPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
  },
  { timestamps: true }
);

mediaSchema.index({ status: 1, createdAt: -1 });

const Media = mongoose.model('Media', mediaSchema);
export default Media;