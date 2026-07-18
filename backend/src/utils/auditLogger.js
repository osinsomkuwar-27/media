import AuditLog from '../models/AuditLog.js';

// Fire-and-forget by design: audit logging must never delay or break
// the request it's observing. Errors are logged to the console only.
export function logAudit({ req, userId = null, action, targetId = null, metadata = {} }) {
  AuditLog.create({
    userId,
    action,
    targetId,
    ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || null,
    userAgent: req?.headers?.['user-agent'] || null,
    metadata,
  }).catch((err) => {
    console.error('Audit log write failed:', err.message);
  });
}