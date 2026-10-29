const express = require('express');
const bcrypt = require('bcryptjs');
const { UserRepository } = require('../models/User');
const { recordAuditLog } = require('../models/AuditLog');
const {
  validateRegistrationInput,
  validateLoginInput,
} = require('../utils/validation');
const {
  AUTH_COOKIE_NAME,
  setAuthCookies,
  clearAuthCookies,
  verifyAuthToken,
  revokeTokenJti,
} = require('../utils/cookies');
const { requireAuth } = require('../middleware/auth');
const { createAuthRateLimiter } = require('../middleware/rateLimiter');
const { connectDatabase, getDatabaseStatus } = require('../config/db');

const router = express.Router();
const authRateLimiter = createAuthRateLimiter();

// Helper to ensure database is ready before attempting DB writes/reads.
// If disconnected at request time, re-reads backend/.env and attempts a live connection first.
async function ensureDatabaseConnected(res) {
  let dbStatus = getDatabaseStatus();
  if (!dbStatus.connected) {
    await connectDatabase();
    dbStatus = getDatabaseStatus();
  }
  if (!dbStatus.connected) {
    res.status(503).json({
      success: false,
      code: dbStatus.errorCode || 'DATABASE_UNAVAILABLE',
      message:
        dbStatus.message ||
        'Database connection is not currently available. Please verify MongoDB Atlas configuration.',
    });
    return false;
  }
  return true;
}

/**
 * GET /api/auth/csrf
 * Issues or refreshes a CSRF token cookie and returns the token for SPA initialization.
 */
router.get('/csrf', (req, res) => {
  return res.status(200).json({
    success: true,
    csrfToken: req.csrfTokenValue || req.cookies.nexora_csrf_token || null,
  });
});

/**
 * POST /api/auth/register
 * Registers a new user account, hashes password with bcryptjs, sets HTTP-only auth cookie,
 * and records both the user document and an audit log in MongoDB Atlas.
 */
router.post('/register', authRateLimiter, async (req, res, next) => {
  try {
    const validation = validateRegistrationInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Please correct the highlighted fields.',
        errors: validation.errors,
      });
    }

    if (!(await ensureDatabaseConnected(res))) return;

    const { name, email, password } = validation.sanitized;

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
        errors: {
          email: 'This email address is already registered.',
        },
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const createdUser = await UserRepository.createUser({
      name,
      email,
      passwordHash,
      req,
    });

    await recordAuditLog({
      userId: createdUser._id,
      email: createdUser.email,
      event: 'REGISTER_SUCCESS',
      status: 'success',
      req,
      details: 'New member account registered via web portal',
    });

    const { csrfToken } = setAuthCookies(res, createdUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: UserRepository.toSafeUser(createdUser),
      csrfToken,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
        errors: {
          email: 'This email address is already registered.',
        },
      });
    }
    return next(err);
  }
});

/**
 * POST /api/auth/login
 * Authenticates existing user credentials, updates login timestamp & count in MongoDB,
 * records audit log, and issues HTTP-only session cookie.
 */
router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const validation = validateLoginInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address and password.',
        errors: validation.errors,
      });
    }

    if (!(await ensureDatabaseConnected(res))) return;

    const { email, password } = validation.sanitized;

    const user = await UserRepository.findByEmail(email, { includeSecrets: true });
    if (!user || !user.passwordHash) {
      await bcrypt.compare(
        password,
        '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW'
      );
      await recordAuditLog({
        email,
        event: 'LOGIN_FAILED',
        status: 'failure',
        req,
        details: 'Account not found for provided email',
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await recordAuditLog({
        userId: user._id,
        email: user.email,
        event: 'LOGIN_FAILED',
        status: 'failure',
        req,
        details: 'Invalid password attempt',
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This account is currently inactive. Please contact support.',
      });
    }

    const updatedUser =
      (await UserRepository.updateLoginTimestamp(user._id || user.id)) || user;

    await recordAuditLog({
      userId: updatedUser._id,
      email: updatedUser.email,
      event: 'LOGIN_SUCCESS',
      status: 'success',
      req,
      details: `Member sign-in #${updatedUser.loginCount || 1}`,
    });

    const { csrfToken } = setAuthCookies(res, updatedUser);

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      user: UserRepository.toSafeUser(updatedUser),
      csrfToken,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/auth/logout
 * Invalidates active token/session, updates lastLogoutAt & audit log in MongoDB, and clears cookies.
 */
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies ? req.cookies[AUTH_COOKIE_NAME] : null;
    if (token) {
      try {
        const decoded = verifyAuthToken(token);
        if (decoded.jti) {
          revokeTokenJti(decoded.jti);
        }
        if (decoded.sub && getDatabaseStatus().connected) {
          const updated = await UserRepository.incrementTokenVersion(decoded.sub);
          await recordAuditLog({
            userId: decoded.sub,
            email: updated?.email || null,
            event: 'LOGOUT',
            status: 'success',
            req,
            details: 'Member signed out and session token invalidated',
          });
        }
      } catch (_ignore) {
        // Token may already be expired; still clear cookies cleanly
      }
    }
  } finally {
    clearAuthCookies(res);
  }

  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's safe profile.
 */
router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
    csrfToken: req.csrfTokenValue || req.cookies.nexora_csrf_token || null,
  });
});

module.exports = router;
