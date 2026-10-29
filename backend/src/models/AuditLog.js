const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      index: true,
    },
    event: {
      type: String,
      enum: [
        'REGISTER_SUCCESS',
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'LOGOUT',
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    details: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'auth_audit_logs',
  }
);

const AuditLog =
  mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

async function recordAuditLog({
  userId = null,
  email = null,
  event,
  status = 'success',
  req = null,
  details = null,
}) {
  try {
    if (mongoose.connection.readyState !== 1) return null;
    const ipAddress = req
      ? String(req.ip || req.headers?.['x-forwarded-for'] || 'unknown')
      : null;
    const userAgent = req
      ? String(req.headers?.['user-agent'] || 'unknown').slice(0, 250)
      : null;

    return await AuditLog.create({
      userId,
      email,
      event,
      status,
      ipAddress,
      userAgent,
      details,
    });
  } catch (_err) {
    // Non-blocking audit logging
    return null;
  }
}

module.exports = {
  AuditLog,
  recordAuditLog,
};
