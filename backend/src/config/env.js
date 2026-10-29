const dotenv = require('dotenv');
const path = require('path');

const ENV_FILE_PATH = path.resolve(__dirname, '../../.env');
dotenv.config({ path: ENV_FILE_PATH });

function reloadEnvFile() {
  if (process.env.NODE_ENV === 'test' || process.env.VERCEL === '1') {
    return;
  }
  dotenv.config({ path: ENV_FILE_PATH, override: true });
}

function getEnvConfig() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  const port = parseInt(process.env.PORT || '5000', 10);
  const mongodbUri = (process.env.MONGODB_URI || '')
    .trim()
    .replace(/^MONGODB_URI\s*=\s*/i, '')
    .replace(/^['"]|['"]$/g, '');
  const jwtSecret =
    process.env.JWT_SECRET ||
    (isTest ? 'test_only_ephemeral_jwt_secret_key_nexora_32_chars_min' : '');
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

  const cookieSecure =
    process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === 'true'
      : isProd;

  const cookieSameSite =
    process.env.COOKIE_SAMESITE || (cookieSecure && isProd ? 'lax' : 'lax');

  if (isProd) {
    if (!mongodbUri || mongodbUri.includes('<username>') || mongodbUri.includes('<password>')) {
      console.warn(
        '[Nexora Env] Warning: MONGODB_URI environment variable is not yet configured in production.'
      );
    }
    if (
      !jwtSecret ||
      jwtSecret.length < 32 ||
      jwtSecret.includes('replace_with_a_strong_random_secret')
    ) {
      console.warn(
        '[Nexora Env] Warning: JWT_SECRET should be set to a random string of at least 32 characters in production.'
      );
    }
  }

  return {
    nodeEnv,
    isProd,
    isTest,
    port,
    mongodbUri,
    jwtSecret,
    jwtExpiresIn,
    frontendOrigin,
    cookieSecure,
    cookieSameSite,
  };
}

module.exports = { getEnvConfig, reloadEnvFile, ENV_FILE_PATH };
