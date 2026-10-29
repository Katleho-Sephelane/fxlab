const rateLimit = require('express-rate-limit');
const { getEnvConfig } = require('../config/env');

function createAuthRateLimiter() {
  const { isTest } = getEnvConfig();
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isTest ? 100 : 15, // Allow higher threshold in automated test runner unless specifically testing limit
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
    },
  });
}

function createApiRateLimiter() {
  const { isTest } = getEnvConfig();
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTest ? 500 : 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please slow down and try again shortly.',
    },
  });
}

module.exports = {
  createAuthRateLimiter,
  createApiRateLimiter,
};
