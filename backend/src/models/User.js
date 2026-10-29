const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email cannot exceed 254 characters'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    loginCount: {
      type: Number,
      default: 1,
    },
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastLogoutAt: {
      type: Date,
      default: null,
    },
    workspacePreferences: {
      theme: {
        type: String,
        default: 'dark-navy',
      },
      defaultView: {
        type: String,
        default: 'overview',
      },
      onboardingPhase: {
        type: String,
        default: 'Phase 1 — Foundation',
      },
    },
    registrationMetadata: {
      source: {
        type: String,
        default: 'nexora-web-portal',
      },
      ipAddress: {
        type: String,
        default: null,
      },
      userAgent: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Ensure passwordHash and internal fields are never serialized to API JSON responses
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    delete ret.tokenVersion;
    return ret;
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const UserRepository = {
  async findByEmail(email, { includeSecrets = false } = {}) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    let query = User.findOne({ email: normalizedEmail });
    if (includeSecrets) {
      query = query.select('+passwordHash +tokenVersion');
    }
    return query.exec();
  },

  async findById(id, { includeSecrets = false } = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    let query = User.findById(id);
    if (includeSecrets) {
      query = query.select('+passwordHash +tokenVersion');
    }
    return query.exec();
  },

  async createUser({ name, email, passwordHash, req = null }) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();
    const now = new Date();

    const ipAddress = req
      ? String(req.ip || req.headers?.['x-forwarded-for'] || 'unknown')
      : null;
    const userAgent = req
      ? String(req.headers?.['user-agent'] || 'unknown').slice(0, 250)
      : null;

    const doc = new User({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      role: 'member',
      accountStatus: 'active',
      loginCount: 1,
      tokenVersion: 0,
      lastLoginAt: now,
      workspacePreferences: {
        theme: 'dark-navy',
        defaultView: 'overview',
        onboardingPhase: 'Phase 1 — Foundation',
      },
      registrationMetadata: {
        source: 'nexora-web-portal',
        ipAddress,
        userAgent,
      },
    });

    await doc.save();
    return doc;
  },

  async updateLoginTimestamp(userId) {
    const now = new Date();
    return User.findByIdAndUpdate(
      userId,
      {
        $set: { lastLoginAt: now },
        $inc: { loginCount: 1 },
      },
      { new: true }
    ).exec();
  },

  async incrementTokenVersion(userId) {
    const now = new Date();
    return User.findByIdAndUpdate(
      userId,
      {
        $inc: { tokenVersion: 1 },
        $set: { lastLogoutAt: now },
      },
      { new: true }
    ).exec();
  },

  toSafeUser(user) {
    if (!user) return null;
    return {
      id: (user._id || user.id).toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'member',
      accountStatus: user.accountStatus || 'active',
      loginCount: user.loginCount || 1,
      lastLoginAt: user.lastLoginAt || null,
      lastLogoutAt: user.lastLogoutAt || null,
      workspacePreferences: user.workspacePreferences || {
        theme: 'dark-navy',
        defaultView: 'overview',
        onboardingPhase: 'Phase 1 — Foundation',
      },
      createdAt: user.createdAt || null,
    };
  },
};

module.exports = {
  User,
  UserRepository,
};
