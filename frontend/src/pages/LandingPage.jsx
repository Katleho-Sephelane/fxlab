import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NexoraLogo from '../components/NexoraLogo';
import { useAuth } from '../context/AuthContext';

const PLANNED_CAPABILITIES = [
  {
    id: 'charting',
    badge: 'Planned Module',
    title: 'Structured Charting & Market Mapping',
    description:
      'Designed to support clean multi-timeframe analysis, key level annotation, and session structure organization within a unified workspace.',
    highlights: [
      'Multi-session layout templates',
      'Clean technical drawing & price-action annotations',
      'Isolated module architecture currently in preparation',
    ],
  },
  {
    id: 'backtesting',
    badge: 'Planned Module',
    title: 'Historical Session Replay & Backtesting',
    description:
      'Built for disciplined strategy validation—allowing traders to test rule-based hypotheses against historical market data before committing live capital.',
    highlights: [
      'Step-by-step historical bar progression',
      'Rule adherence & setup tagging during simulation',
      'Structured hypothesis tracking across market regimes',
    ],
  },
  {
    id: 'analytics',
    badge: 'Planned Module',
    title: 'Execution & Risk Analytics',
    description:
      'Move beyond raw P&L with objective diagnostics around drawdown behavior, risk-to-reward distribution, session timing, and execution consistency.',
    highlights: [
      'R-multiple & expectancy distribution breakdowns',
      'Session & time-of-day performance segmentation',
      'Structured trade journaling with post-trade checklists',
    ],
  },
  {
    id: 'ai-tools',
    badge: 'Future Vision',
    title: 'AI-Assisted Research & Review Workflows',
    description:
      'Practical AI utilities focused on summarizing journaled trade logs, highlighting recurring execution errors, and organizing market research notes.',
    highlights: [
      'Automated weekly execution review summaries',
      'Pattern detection in personal rule violations',
      'Research synthesis without black-box signal hype',
    ],
  },
];

const ROADMAP_PHASES = [
  {
    phase: 'Phase 1',
    status: 'Live Now',
    isCurrent: true,
    title: 'Core Platform, Identity & Member Workspace',
    summary:
      'Foundation release establishing Nexora’s web presence, hardened authentication service, HTTP-only session management, and member dashboard shell.',
    deliverables: [
      'Public platform overview & transparent roadmap',
      'Account registration, login & bcrypt password security',
      'Protected member dashboard & workspace profile',
      'Production-ready MERN architecture',
    ],
  },
  {
    phase: 'Phase 2',
    status: 'Planned — Not Yet Available',
    isCurrent: false,
    title: 'Charting Workspace & Historical Replay Engine',
    summary:
      'Introduction of interactive charting layouts and historical market simulation tools once licensing verification and data pipeline engineering are completed.',
    deliverables: [
      'Dedicated charting module integration',
      'Historical session replay controls',
      'Saved workspace layouts & study templates',
    ],
  },
  {
    phase: 'Phase 3',
    status: 'Planned — Not Yet Available',
    isCurrent: false,
    title: 'Quantitative Trade Journal & Risk Diagnostics',
    summary:
      'Deep analytical reporting linking backtested sessions and logged executions to measurable risk and behavioral metrics.',
    deliverables: [
      'Structured trade log importer & manual journal',
      'Drawdown, expectancy & R-multiple analytics',
      'Playbook tagging & checklist compliance tracking',
    ],
  },
  {
    phase: 'Phase 4',
    status: 'Future Roadmap — Not Yet Available',
    isCurrent: false,
    title: 'Applied AI Research & Review Assistant',
    summary:
      'Intelligent workflow assistants that help traders synthesize research notes and audit their historical execution discipline.',
    deliverables: [
      'AI-assisted trade journal review reports',
      'Automated anomaly & tilt-pattern flagging',
      'Structured pre-session preparation briefs',
    ],
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-bg-grid" aria-hidden="true" />
          <div className="container hero-section__inner">
            <div className="hero-section__content">
              <div className="eyebrow-pill">
                <span className="eyebrow-pill__dot" aria-hidden="true" />
                <span>Nexora Platform &middot; Phase 1 Foundation Release</span>
              </div>

              <h1 className="hero-section__title">
                Disciplined Trading Technology &amp;{' '}
                <span className="text-gradient">Market Research Infrastructure</span>
              </h1>

              <p className="hero-section__subtitle">
                Nexora is building a unified trading technology ecosystem designed for
                systematic market research, historical strategy validation, quantitative
                execution review, and future AI-assisted analytical workflows.
              </p>

              <div className="hero-section__cta-group">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="btn btn--primary btn--lg">
                      Go to Dashboard
                    </Link>
                    <a href="#roadmap" className="btn btn--secondary btn--lg">
                      Explore Product Roadmap
                    </a>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn btn--primary btn--lg">
                      Create account
                    </Link>
                    <Link to="/login" className="btn btn--secondary btn--lg">
                      Sign in
                    </Link>
                  </>
                )}
              </div>

              <div className="hero-section__trust-note">
                <span className="hero-section__trust-badge">Transparent Status</span>
                <p>
                  Early-access account registration and workspace setup are live now.
                  Charting, backtesting, and AI research modules are actively planned for
                  upcoming phases.
                </p>
              </div>
            </div>

            {/* Architectural Workspace Preview Card (Honest representation, no fake market tickers) */}
            <div className="hero-preview" aria-label="Nexora Workspace Architecture Preview">
              <div className="hero-preview__window">
                <div className="hero-preview__header">
                  <div className="hero-preview__window-controls" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="hero-preview__title-bar">
                    <NexoraLogo size={20} showWordmark={false} />
                    <span>nexora://workspace/architecture-overview</span>
                  </div>
                  <span className="badge badge--live">Phase 1 Active</span>
                </div>

                <div className="hero-preview__body">
                  <div className="hero-preview__status-banner">
                    <div>
                      <span className="hero-preview__label">System Layer</span>
                      <h2 className="hero-preview__heading">
                        Core Identity &amp; Modular Research Shell
                      </h2>
                    </div>
                    <span className="status-pill status-pill--online">
                      Auth API Operational
                    </span>
                  </div>

                  <div className="hero-preview__module-list">
                    <div className="hero-preview__module-item hero-preview__module-item--active">
                      <div className="hero-preview__module-meta">
                        <span className="module-tag module-tag--ready">Operational</span>
                        <h3>Member Identity &amp; Protected Workspace</h3>
                      </div>
                      <p>
                        Bcrypt password hashing, HTTP-only session cookies, CSRF
                        protection, and persistent account workspace.
                      </p>
                    </div>

                    <div className="hero-preview__module-item">
                      <div className="hero-preview__module-meta">
                        <span className="module-tag module-tag--planned">
                          Planned &middot; Phase 2
                        </span>
                        <h3>Charting &amp; Historical Session Replay</h3>
                      </div>
                      <p>
                        Isolated workspace container reserved for future multi-timeframe
                        charting and historical bar-by-bar simulation.
                      </p>
                    </div>

                    <div className="hero-preview__module-item">
                      <div className="hero-preview__module-meta">
                        <span className="module-tag module-tag--planned">
                          Planned &middot; Phase 3–4
                        </span>
                        <h3>Execution Analytics &amp; Applied AI Review</h3>
                      </div>
                      <p>
                        Quantitative journaling, expectancy metrics, and AI-assisted
                        execution diagnostics scheduled for subsequent releases.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Planned Platform Capabilities Section */}
        <section id="capabilities" className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Platform Vision</span>
              <h2 className="section-title">
                Engineered for Structured Research, Not Noise
              </h2>
              <p className="section-description">
                Modern traders often fragment their workflow across disconnected charting
                tabs, spreadsheets, and notes. Nexora is architected to bring technical
                preparation, historical testing, and post-session review into one cohesive
                environment.
              </p>
            </div>

            <div className="capabilities-grid">
              {PLANNED_CAPABILITIES.map((item) => (
                <article key={item.id} className="feature-card">
                  <div className="feature-card__top">
                    <span className="badge badge--purple">{item.badge}</span>
                  </div>
                  <h3 className="feature-card__title">{item.title}</h3>
                  <p className="feature-card__description">{item.description}</p>
                  <ul className="feature-card__list">
                    {item.highlights.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Product Roadmap Section */}
        <section id="roadmap" className="section section--alt">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Development Roadmap</span>
              <h2 className="section-title">
                Transparent Phased Rollout
              </h2>
              <p className="section-description">
                We believe in clear engineering milestones. Below is what is live in
                Nexora today versus what is scheduled for upcoming development phases.
              </p>
            </div>

            <div className="roadmap-grid">
              {ROADMAP_PHASES.map((item) => (
                <article
                  key={item.phase}
                  className={`roadmap-card ${
                    item.isCurrent ? 'roadmap-card--current' : ''
                  }`}
                >
                  <div className="roadmap-card__header">
                    <span className="roadmap-card__phase">{item.phase}</span>
                    <span
                      className={`badge ${
                        item.isCurrent ? 'badge--live' : 'badge--planned'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h3 className="roadmap-card__title">{item.title}</h3>
                  <p className="roadmap-card__summary">{item.summary}</p>
                  <ul className="roadmap-card__deliverables">
                    {item.deliverables.map((del) => (
                      <li key={del}>{del}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Architecture Section */}
        <section id="architecture" className="section">
          <div className="container">
            <div className="architecture-banner">
              <div className="architecture-banner__content">
                <span className="section-eyebrow">Security-First Foundation</span>
                <h2 className="section-title">
                  Built with Production-Minded Application Security
                </h2>
                <p className="section-description">
                  Before introducing market data feeds or analytical engines, Phase 1
                  prioritizes a resilient identity and workspace architecture.
                </p>

                <div className="security-pillars">
                  <div className="security-pillar">
                    <h3>HTTP-Only Session Cookies</h3>
                    <p>
                      Authentication tokens are stored exclusively in HTTP-only cookies
                      with CSRF protection—never exposed to browser localStorage.
                    </p>
                  </div>
                  <div className="security-pillar">
                    <h3>Strict Input &amp; Password Policy</h3>
                    <p>
                      Server-side normalization, bcrypt cryptographic hashing, rate-limited
                      authentication endpoints, and safe error responses.
                    </p>
                  </div>
                  <div className="security-pillar">
                    <h3>Modular Workspace Isolation</h3>
                    <p>
                      Clean boundary between the core member portal and upcoming charting,
                      backtesting, and AI research modules.
                    </p>
                  </div>
                </div>
              </div>

              <div className="architecture-banner__cta-box">
                <NexoraLogo size={48} showWordmark={false} />
                <h3>Reserve Your Nexora Workspace</h3>
                <p>
                  Create your Nexora account today to access the Phase 1 member dashboard
                  and track upcoming research module releases.
                </p>
                <div className="architecture-banner__buttons">
                  {isAuthenticated ? (
                    <Link to="/dashboard" className="btn btn--primary btn--full">
                      Open Member Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link to="/register" className="btn btn--primary btn--full">
                        Create account
                      </Link>
                      <Link to="/login" className="btn btn--secondary btn--full">
                        Sign in to existing account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
