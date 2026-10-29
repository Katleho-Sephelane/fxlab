const { createApp } = require('../backend/src/app');
const { connectDatabase, getDatabaseStatus } = require('../backend/src/config/db');

const app = createApp();

module.exports = async (req, res) => {
  if (!getDatabaseStatus().connected) {
    await connectDatabase();
  }
  return app(req, res);
};
