const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { getEnvConfig } = require('./config/env');
const { connectDatabase, getDatabaseStatus } = require('./config/db');
const { csrfProtection } = require('./middleware/csrf');
const { createApiRateLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

function createApp() {
  const app = express();
  const { frontendOrigin, nodeEnv } = getEnvConfig();

  // Trust first proxy when deployed behind Render / Railway / reverse proxy
  app.set('trust proxy', 1);

  // Security headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
    })
  );

  // Narrow CORS configuration supporting credentialed requests from allowed frontend origin(s)
  const allowedOrigins = frontendOrigin
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  app.use(
    cors({
      origin(origin, callback) {
        // Allow server-to-server / same-origin / health checks / test requests with no Origin header
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, '');
        if (
          allowedOrigins.includes(normalizedOrigin) ||
          (process.env.VERCEL === '1' && normalizedOrigin.endsWith('.vercel.app'))
        ) {
          return callback(null, true);
        }
        const corsErr = new Error('Not allowed by CORS policy');
        corsErr.status = 403;
        return callback(corsErr);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Requested-With', 'Accept'],
    })
  );

  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  app.use(cookieParser());

  // Global API rate limiter
  app.use('/api', createApiRateLimiter());

  // Ensure MongoDB connection is initialized on serverless cold starts (e.g. Vercel Express service)
  app.use('/api', async (_req, _res, next) => {
    try {
      if (!getDatabaseStatus().connected) {
        await connectDatabase();
      }
      return next();
    } catch (err) {
      return next(err);
    }
  });

  // Health-check endpoint (safe diagnostic output, no secrets exposed)
  app.get('/api/health', (_req, res) => {
    const dbStatus = getDatabaseStatus();
    return res.status(200).json({
      success: true,
      service: 'nexora-api',
      environment: nodeEnv,
      timestamp: new Date().toISOString(),
      database: {
        connected: dbStatus.connected,
        status: dbStatus.status,
        errorCode: dbStatus.errorCode || null,
        message: dbStatus.message || null,
      },
    });
  });

  // Apply CSRF protection across API routes
  app.use('/api', csrfProtection);

  // Mount feature routes
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // 404 handler for unknown API routes
  app.use('/api/*', (_req, res) => {
    return res.status(404).json({
      success: false,
      message: 'Requested API endpoint does not exist.',
    });
  });

  // Centralized safe error handler (never leaks stack traces or sensitive values)
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({
        success: false,
        message: 'Malformed JSON request body.',
      });
    }

    if (err.status === 403) {
      return res.status(403).json({
        success: false,
        message: err.message || 'Forbidden request.',
      });
    }

    if (nodeEnv !== 'test') {
      console.error('[Nexora API Error]:', err.message || 'Unexpected error');
    }

    return res.status(err.status || 500).json({
      success: false,
      message: 'An unexpected server error occurred. Please try again later.',
    });
  });

  return app;
}

module.exports = { createApp };
