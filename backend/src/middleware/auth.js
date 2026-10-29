const {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
  clearAuthCookies,
} = require('../utils/cookies');
const { UserRepository } = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies ? req.cookies[AUTH_COOKIE_NAME] : null;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to continue.',
      });
    }

    const decoded = verifyAuthToken(token);
    const user = await UserRepository.findById(decoded.sub, { includeSecrets: true });

    if (!user || user.accountStatus !== 'active') {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Session is no longer valid. Please sign in again.',
      });
    }

    const currentTokenVersion = user.tokenVersion || 0;
    if (decoded.tv !== undefined && decoded.tv !== currentTokenVersion) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Session expired or signed out. Please sign in again.',
      });
    }

    req.user = UserRepository.toSafeUser(user);
    req.tokenPayload = decoded;
    return next();
  } catch (_err) {
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session.',
    });
  }
}

module.exports = { requireAuth };
