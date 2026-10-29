const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getEnvConfig } = require('../config/env');

const AUTH_COOKIE_NAME = 'nexora_access_token';
const CSRF_COOKIE_NAME = 'nexora_csrf_token';

// Track explicitly revoked JWT IDs in-memory in addition to user.tokenVersion
const revokedTokenIds = new Set();

function getEffectiveSecret() {
  const { jwtSecret } = getEnvConfig();
  if (jwtSecret && !jwtSecret.includes('replace_with_a_strong_random_secret')) {
    return jwtSecret;
  }
  return 'nexora_fallback_hmac_secret_set_jwt_secret_in_env_vars_32_chars';
}

function signAuthToken(user) {
  const { jwtExpiresIn } = getEnvConfig();
  const jti = crypto.randomUUID();
  const payload = {
    sub: (user._id || user.id).toString(),
    role: user.role || 'member',
    tv: user.tokenVersion || 0,
    jti,
  };

  const token = jwt.sign(payload, getEffectiveSecret(), {
    expiresIn: jwtExpiresIn,
    issuer: 'nexora-api',
    audience: 'nexora-web',
  });

  return { token, jti };
}

function verifyAuthToken(token) {
  const decoded = jwt.verify(token, getEffectiveSecret(), {
    issuer: 'nexora-api',
    audience: 'nexora-web',
  });
  if (decoded.jti && revokedTokenIds.has(decoded.jti)) {
    const err = new Error('Token has been revoked');
    err.name = 'TokenRevokedError';
    throw err;
  }
  return decoded;
}

function revokeTokenJti(jti) {
  if (jti) {
    revokedTokenIds.add(jti);
  }
}

function getAuthCookieOptions() {
  const { cookieSecure, cookieSameSite } = getEnvConfig();
  return {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

function getCsrfCookieOptions() {
  const { cookieSecure, cookieSameSite } = getEnvConfig();
  return {
    httpOnly: false, // Readable by frontend JS to attach as X-CSRF-Token header
    secure: cookieSecure,
    sameSite: cookieSameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setAuthCookies(res, user) {
  const { token } = signAuthToken(user);
  const csrfToken = generateCsrfToken();

  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions());

  return { csrfToken };
}

function clearAuthCookies(res) {
  const authOpts = getAuthCookieOptions();
  const csrfOpts = getCsrfCookieOptions();

  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: authOpts.httpOnly,
    secure: authOpts.secure,
    sameSite: authOpts.sameSite,
    path: authOpts.path,
  });
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: csrfOpts.httpOnly,
    secure: csrfOpts.secure,
    sameSite: csrfOpts.sameSite,
    path: csrfOpts.path,
  });
}

module.exports = {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  signAuthToken,
  verifyAuthToken,
  revokeTokenJti,
  generateCsrfToken,
  getCsrfCookieOptions,
  setAuthCookies,
  clearAuthCookies,
};
