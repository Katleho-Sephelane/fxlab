const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { PlatformModule, INITIAL_MODULES } = require('../models/PlatformModule');
const { AuditLog } = require('../models/AuditLog');

const router = express.Router();

/**
 * GET /api/dashboard/overview
 * Protected endpoint returning the authenticated user's workspace status,
 * planned modules loaded from MongoDB Atlas, and recent account security audit logs.
 */
router.get('/overview', requireAuth, async (req, res) => {
  let modules = INITIAL_MODULES;
  let recentActivity = [];

  try {
    const dbModules = await PlatformModule.find({}).sort({ phaseNumber: 1 }).lean();
    if (dbModules && dbModules.length > 0) {
      modules = dbModules.map((m) => ({
        id: m.moduleId,
        title: m.title,
        category: m.category,
        status: m.status,
        available: m.available,
        description: m.description,
      }));
    }

    const logs = await AuditLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    recentActivity = logs.map((log) => ({
      id: log._id.toString(),
      event: log.event,
      status: log.status,
      details: log.details,
      createdAt: log.createdAt,
    }));
  } catch (_err) {
    // Fallback gracefully if query fails
  }

  return res.status(200).json({
    success: true,
    workspace: {
      owner: req.user,
      phase: 'Phase 1 — Foundation & Account Workspace',
      tradingEngineActive: false,
      chartingIntegrated: false,
      statusNotice:
        'Your Nexora account is stored in MongoDB Atlas and active. Trading execution, charting, historical backtesting, and AI research modules are currently in development and not yet enabled.',
      upcomingModules: modules,
      recentActivity,
    },
  });
});

module.exports = router;
