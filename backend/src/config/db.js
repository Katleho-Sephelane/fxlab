const mongoose = require('mongoose');
const { getEnvConfig, reloadEnvFile } = require('./env');
const { User } = require('../models/User');
const { AuditLog } = require('../models/AuditLog');
const { PlatformModule, seedPlatformModules } = require('../models/PlatformModule');

let connectionState = {
  connected: false,
  status: 'disconnected',
  databaseName: 'nexora',
  errorCode: null,
  lastError: null,
};

function isPlaceholderUri(uri) {
  if (!uri || typeof uri !== 'string') return true;
  const trimmed = uri.trim().toLowerCase();
  return (
    trimmed === '' ||
    trimmed.includes('<username>') ||
    trimmed.includes('<password>') ||
    trimmed.includes('<cluster-url>') ||
    trimmed.includes('your_db_user') ||
    trimmed.includes('your_db_password') ||
    trimmed.includes('your_cluster')
  );
}

function classifyMongoError(err) {
  const msg = String((err && err.message) || '');
  const codeName = String((err && err.codeName) || '');

  if (
    msg.toLowerCase().includes('bad auth') ||
    msg.toLowerCase().includes('authentication failed') ||
    codeName === 'AtlasError' ||
    err?.code === 8000 ||
    err?.code === 18
  ) {
    return {
      status: 'auth_failed',
      errorCode: 'DB_AUTH_FAILED',
      lastError:
        'MongoDB Atlas authentication failed. Verify the database username and password in backend/.env (URL-encode special characters in the password).',
    };
  }

  if (
    msg.includes('querySrv ENOTFOUND') ||
    msg.includes('querySrv EBADNAME') ||
    msg.includes('getaddrinfo ENOTFOUND')
  ) {
    return {
      status: 'invalid_host',
      errorCode: 'DB_HOST_NOT_FOUND',
      lastError:
        'MongoDB Atlas cluster hostname could not be resolved. Verify the @<cluster-url> host in MONGODB_URI inside backend/.env.',
    };
  }

  if (
    err?.name === 'MongoServerSelectionError' ||
    msg.toLowerCase().includes('server selection timed out') ||
    msg.toLowerCase().includes('whitelist') ||
    msg.toLowerCase().includes("ip that isn't whitelisted")
  ) {
    return {
      status: 'network_blocked',
      errorCode: 'DB_NETWORK_BLOCKED',
      lastError:
        'Could not reach MongoDB Atlas cluster. Ensure your current IP address is allowed under MongoDB Atlas -> Network Access.',
    };
  }

  return {
    status: 'error',
    errorCode: 'DB_CONNECTION_ERROR',
    lastError:
      'Unable to connect to MongoDB Atlas. Check MONGODB_URI syntax and Network Access settings.',
  };
}

async function initializeCollectionsAndSeed() {
  try {
    await Promise.all([
      User.init(),
      AuditLog.init(),
      PlatformModule.init(),
    ]);
    await seedPlatformModules();
    console.log(
      '[Nexora DB] Verified collections (users, auth_audit_logs, platform_modules) in database "nexora".'
    );
  } catch (err) {
    console.warn('[Nexora DB] Collection initialization warning:', err.message);
  }
}

async function connectDatabase() {
  reloadEnvFile();
  const { mongodbUri, isTest } = getEnvConfig();
  const dbName = process.env.MONGODB_DB_NAME || 'nexora';

  if (mongoose.connection.readyState === 1) {
    connectionState = {
      connected: true,
      status: 'connected',
      databaseName: mongoose.connection.name || dbName,
      errorCode: null,
      lastError: null,
    };
    return connectionState;
  }

  const targetUri =
    isTest && process.env.TEST_MONGODB_URI ? process.env.TEST_MONGODB_URI : mongodbUri;

  if (isPlaceholderUri(targetUri)) {
    connectionState = {
      connected: false,
      status: 'unconfigured',
      databaseName: dbName,
      errorCode: 'DB_URI_PLACEHOLDER',
      lastError:
        'MONGODB_URI in backend/.env still has a placeholder cluster address. Replace it with your actual MongoDB Atlas connection string.',
    };
    console.warn(`[Nexora DB] Warning: ${connectionState.lastError}`);
    return connectionState;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(targetUri, {
      dbName,
      serverSelectionTimeoutMS: 8000,
    });

    connectionState = {
      connected: true,
      status: 'connected',
      databaseName: mongoose.connection.name || dbName,
      errorCode: null,
      lastError: null,
    };
    console.log(
      `[Nexora DB] Connected to MongoDB Atlas successfully (database: "${connectionState.databaseName}").`
    );

    await initializeCollectionsAndSeed();
  } catch (err) {
    const classified = classifyMongoError(err);
    connectionState = {
      connected: false,
      status: classified.status,
      databaseName: dbName,
      errorCode: classified.errorCode,
      lastError: classified.lastError,
    };
    console.error(
      `[Nexora DB] Connection error (${classified.errorCode}): ${classified.lastError}`
    );
  }

  return connectionState;
}

function getDatabaseStatus() {
  const readyState = mongoose.connection.readyState;
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    connected: readyState === 1,
    status: readyState === 1 ? 'connected' : connectionState.status || stateMap[readyState],
    databaseName: mongoose.connection.name || connectionState.databaseName || 'nexora',
    errorCode: readyState === 1 ? null : connectionState.errorCode,
    readyState,
    message: readyState === 1 ? null : connectionState.lastError || null,
  };
}

module.exports = {
  connectDatabase,
  getDatabaseStatus,
};
