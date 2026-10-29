const { createApp } = require('./app');
const { connectDatabase } = require('./config/db');
const { getEnvConfig } = require('./config/env');

const app = createApp();

async function startServer() {
  const { port, nodeEnv, frontendOrigin } = getEnvConfig();

  await connectDatabase();

  const server = app.listen(port, () => {
    console.log(
      `[Nexora API] Server listening on http://localhost:${port} (${nodeEnv}) — Allowed Origin: ${frontendOrigin}`
    );
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `[Nexora API] Port ${port} is already in use by another terminal/process. Run "npm start" again or stop the existing terminal.`
      );
      process.exit(1);
    }
  });

  const shutdown = (signal) => {
    console.log(`[Nexora API] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Start standalone HTTP listener when running locally or on traditional Node hosts (not Vercel serverless)
if (require.main === module && !process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('[Nexora API] Fatal startup error:', err.message);
    process.exit(1);
  });
}

module.exports = app;
