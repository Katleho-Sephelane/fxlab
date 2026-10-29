const mongoose = require('mongoose');

const platformModuleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    phaseNumber: {
      type: Number,
      required: true,
    },
    available: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'platform_modules',
  }
);

const PlatformModule =
  mongoose.models.PlatformModule ||
  mongoose.model('PlatformModule', platformModuleSchema);

const INITIAL_MODULES = [
  {
    moduleId: 'charting-workspace',
    title: 'Multi-Timeframe Charting Workspace',
    category: 'Visual Analysis',
    status: 'Planned — Phase 2',
    phaseNumber: 2,
    available: false,
    description:
      'Dedicated institutional-style charting canvas for technical structure mapping, drawing annotations, and multi-session layout templates.',
  },
  {
    moduleId: 'historical-backtesting',
    title: 'Historical Session Replay & Backtesting',
    category: 'Strategy Validation',
    status: 'Planned — Phase 2',
    phaseNumber: 2,
    available: false,
    description:
      'Tick-by-tick and bar-by-bar historical market simulation to test rule-based execution hypotheses without live capital exposure.',
  },
  {
    moduleId: 'performance-analytics',
    title: 'Execution & Risk Analytics',
    category: 'Quantitative Review',
    status: 'Planned — Phase 3',
    phaseNumber: 3,
    available: false,
    description:
      'Structured journaling, drawdown distribution tracking, expectancy metrics, and session-by-session behavioral diagnostics.',
  },
  {
    moduleId: 'ai-research-copilot',
    title: 'AI Market Research & Trade Review Assistant',
    category: 'Applied AI Tools',
    status: 'Planned — Phase 4',
    phaseNumber: 4,
    available: false,
    description:
      'Automated post-session review summaries, regime classification research, and rule adherence checks powered by structured AI workflows.',
  },
];

async function seedPlatformModules() {
  if (mongoose.connection.readyState !== 1) return;
  for (const mod of INITIAL_MODULES) {
    await PlatformModule.findOneAndUpdate(
      { moduleId: mod.moduleId },
      { $set: mod },
      { upsert: true, new: true }
    );
  }
}

module.exports = {
  PlatformModule,
  INITIAL_MODULES,
  seedPlatformModules,
};
