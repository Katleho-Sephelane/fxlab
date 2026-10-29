const crypto = require('crypto');
const {
  CSRF_COOKIE_NAME,
  AUTH_COOKIE_NAME,
  generateCsrfToken,
  getCsrfCookieOptions,
} = require('../utils/cookies');

/**
 * Ensures a CSRF cookie is issued on safe requests and enforces Double-Submit Cookie
 * verification on state-changing requests whenever an auth or CSRF cookie is present.
 * Also requires custom X-Requested-With or JSON content-type to prevent simple form CSRF.
 */
function csrfProtection(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  if (safeMethods.includes(req.method)) {
    if (!req.cookies[CSRF_COOKIE_NAME]) {
      const token = generateCsrfToken();
      res.cookie(CSRF_COOKIE_NAME, token, getCsrfCookieOptions());
      req.csrfTokenValue = token;
    } else {
      req.csrfTokenValue = req.cookies[CSRF_COOKIE_NAME];
    }
    return next();
  }

  // For state-changing requests (POST, PUT, PATCH, DELETE):
  // Require JSON Content-Type or custom X-Requested-With / X-CSRF-Token header
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  const requestedWith = req.headers['x-requested-with'];
  const headerCsrf = req.headers['x-csrf-token'];
  const cookieCsrf = req.cookies[CSRF_COOKIE_NAME];
  const hasAuthCookie = Boolean(req.cookies[AUTH_COOKIE_NAME]);

  if (!contentType.includes('application/json') && !requestedWith && !headerCsrf) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Invalid request format or missing security headers.',
    });
  }

  // If the client already holds an authenticated cookie or CSRF cookie, verify match
  if (hasAuthCookie && cookieCsrf) {
    if (!headerCsrf || typeof headerCsrf !== 'string') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Missing CSRF token header.',
      });
    }

    const cookieBuf = Buffer.from(cookieCsrf);
    const headerBuf = Buffer.from(headerCsrf);
    if (
      cookieBuf.length !== headerBuf.length ||
      !crypto.timingSafeEqual(cookieBuf, headerBuf)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid CSRF token.',
      });
    }
  }

  return next();
}

module.exports = { csrfProtection };
