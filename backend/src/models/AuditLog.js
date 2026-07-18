import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: {
      type: String,
      enum: [
        'USER_REGISTERED',
        'USER_LOGIN',
        'MEDIA_UPLOADED',
        'MEDIA_UNLOCKED',
        'MEDIA_ACCESSED',
        'FAILED_MEDIA_ACCESS',
      ],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;