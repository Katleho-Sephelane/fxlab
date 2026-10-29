import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NexoraLogo from '../components/NexoraLogo';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

const DEFAULT_MODULES = [
  {
    id: 'charting-workspace',
    title: 'Multi-Timeframe Charting Workspace',
    category: 'Visual Analysis',
    status: 'Planned — Phase 2',
    available: false,
    description:
      'Dedicated institutional-style charting canvas for technical structure mapping, drawing annotations, and multi-session layout templates.',
  },
  {
    id: 'historical-backtesting',
    title: 'Historical Session Replay & Backtesting',
    category: 'Strategy Validation',
    status: 'Planned — Phase 2',
    available: false,
    description:
      'Tick-by-tick and bar-by-bar historical market simulation to test rule-based execution hypotheses without live capital exposure.',
  },
  {
    id: 'performance-analytics',
    title: 'Execution & Risk Analytics',
    category: 'Quantitative Review',
    status: 'Planned — Phase 3',
    available: false,
    description:
      'Structured journaling, drawdown distribution tracking, expectancy metrics, and session-by-session behavioral diagnostics.',
  },
  {
    id: 'ai-research-copilot',
    title: 'AI Market Research & Trade Review Assistant',
    category: 'Applied AI Tools',
    status: 'Planned — Phase 4',
    available: false,
    description:
      'Automated post-session review summaries, regime classification research, and rule adherence checks powered by structured AI workflows.',
  },
];

const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Workspace Overview', badge: 'Active' },
  { id: 'charting-workspace', label: 'Charting Module', badge: 'Planned' },
  { id: 'historical-backtesting', label: 'Backtesting Engine', badge: 'Planned' },
  { id: 'performance-analytics', label: 'Execution Analytics', badge: 'Planned' },
  { id: 'ai-research-copilot', label: 'AI Research Tools', badge: 'Planned' },
  { id: 'profile', label: 'Account & Security', badge: null },
];

function formatDate(dateInput) {
  if (!dateInput) return 'Active session';
  try {
    return new Date(dateInput).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (_e) {
    return 'Active session';
  }
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [workspaceData, setWorkspaceData] = useState(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardOverview() {
      setIsLoadingWorkspace(true);
      try {
        const res = await apiRequest('/dashboard/overview', { method: 'GET' });
        if (isMounted && res.workspace) {
          setWorkspaceData(res.workspace);
        }
      } catch (_err) {
        // Fallback to local structure if transient error occurs
      } finally {
        if (isMounted) {
          setIsLoadingWorkspace(false);
        }
      }
    }
    loadDashboardOverview();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const modules = workspaceData?.upcomingModules || DEFAULT_MODULES;
  const selectedModule = modules.find((m) => m.id === activeTab);

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar" aria-label="Workspace Sidebar">
        <div className="dashboard-sidebar__top">
          <Link to="/" className="site-header__brand-link">
            <NexoraLogo size={32} showWordmark={true} subtitle="Member Workspace" />
          </Link>
        </div>

        <nav className="dashboard-sidebar__nav">
          <div className="dashboard-sidebar__group-label">Workspace Navigation</div>
          {SIDEBAR_ITEMS.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`dashboard-nav-item ${isSelected ? 'is-active' : ''}`}
              >
                <span className="dashboard-nav-item__label">{item.label}</span>
                {item.badge && (
                  <span
                    className={`dashboard-nav-item__badge ${
                      item.badge === 'Active' ? 'is-live' : 'is-planned'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="dashboard-sidebar__footer">
          <div className="dashboard-user-mini">
            <div className="dashboard-user-mini__avatar" aria-hidden="true">
              {(user?.name || 'N').charAt(0).toUpperCase()}
            </div>
            <div className="dashboard-user-mini__info">
              <span className="dashboard-user-mini__name">{user?.name}</span>
              <span className="dashboard-user-mini__email">{user?.email}</span>
            </div>
          </div>

          <div className="dashboard-sidebar__actions">
            <Link to="/" className="btn btn--ghost btn--sm btn--full">
              Public Website
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="btn btn--secondary btn--sm btn--full"
            >
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="dashboard-topbar__eyebrow">
              {workspaceData?.phase || 'Phase 1 — Foundation & Account Workspace'}
            </span>
            <h1 className="dashboard-topbar__title">
              Welcome back, {user?.name || 'Trader'}
            </h1>
          </div>

          <div className="dashboard-topbar__right">
            <span className="status-pill status-pill--online">
              <span className="status-dot status-dot--online" aria-hidden="true" />
              Account Active
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="btn btn--secondary btn--sm"
            >
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          {/* Honest Empty State / Phase 1 Notice Banner */}
          <section className="dashboard-empty-state" aria-label="Platform Status Notice">
            <div className="dashboard-empty-state__icon" aria-hidden="true">
              <NexoraLogo size={38} showWordmark={false} />
            </div>
            <div className="dashboard-empty-state__body">
              <div className="dashboard-empty-state__header">
                <h2>Trading &amp; Research Tools Are Coming in Upcoming Phases</h2>
                <span className="badge badge--planned">No Live Market Feed Active</span>
              </div>
              <p>
                {workspaceData?.statusNotice ||
                  'Your Nexora account and workspace identity are configured. Interactive charting, historical session backtesting, execution analytics, and AI research modules are currently in development and not yet enabled in this Phase 1 release.'}
              </p>
            </div>
          </section>

          {/* Dynamic View for Selected Planned Module */}
          {selectedModule && (
            <section className="dashboard-module-focus">
              <div className="dashboard-module-focus__header">
                <div>
                  <span className="section-eyebrow">{selectedModule.category}</span>
                  <h2>{selectedModule.title}</h2>
                </div>
                <span className="badge badge--purple">{selectedModule.status}</span>
              </div>
              <p className="dashboard-module-focus__desc">
                {selectedModule.description}
              </p>
              <div className="dashboard-module-focus__notice">
                <strong>Module Status:</strong> This module container is intentionally
                isolated during Phase 1. No market data feeds, charting libraries, or
                simulated execution engines are active yet.
              </div>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => setActiveTab('overview')}
              >
                Return to All Modules Overview
              </button>
            </section>
          )}

          {/* Account & Profile Summary */}
          <section className="dashboard-section" aria-labelledby="account-summary-heading">
            <div className="dashboard-section__header">
              <h2 id="account-summary-heading">Account &amp; Profile Summary</h2>
              <span className="badge badge--live">Verified Session</span>
            </div>

            <div className="profile-summary-grid">
              <div className="profile-stat-card">
                <span className="profile-stat-card__label">Account Holder</span>
                <strong className="profile-stat-card__value">{user?.name}</strong>
                <span className="profile-stat-card__meta">Role: {user?.role || 'member'}</span>
              </div>

              <div className="profile-stat-card">
                <span className="profile-stat-card__label">Registered Email</span>
                <strong className="profile-stat-card__value">{user?.email}</strong>
                <span className="profile-stat-card__meta">Normalized &amp; unique</span>
              </div>

              <div className="profile-stat-card">
                <span className="profile-stat-card__label">Account Status</span>
                <strong className="profile-stat-card__value profile-stat-card__value--online">
                  {user?.accountStatus === 'active' ? 'Active' : user?.accountStatus}
                </strong>
                <span className="profile-stat-card__meta">
                  Joined: {formatDate(user?.createdAt)}
                </span>
              </div>

              <div className="profile-stat-card">
                <span className="profile-stat-card__label">Session Protection</span>
                <strong className="profile-stat-card__value">HTTP-Only Cookie + CSRF</strong>
                <span className="profile-stat-card__meta">
                  Last login: {formatDate(user?.lastLoginAt)} &middot; Sign-ins:{' '}
                  {user?.loginCount || 1}
                </span>
              </div>
            </div>
          </section>

          {/* Recent Account Security Activity (Recorded in MongoDB Atlas auth_audit_logs) */}
          {workspaceData?.recentActivity && workspaceData.recentActivity.length > 0 && (
            <section className="dashboard-section" aria-labelledby="security-activity-heading">
              <div className="dashboard-section__header">
                <div>
                  <h2 id="security-activity-heading">Recent Account Activity (MongoDB Audit Log)</h2>
                  <p className="dashboard-section__subtitle">
                    Recorded authentication events stored in your MongoDB Atlas cluster.
                  </p>
                </div>
              </div>
              <div className="profile-stat-card">
                <ul className="feature-card__list">
                  {workspaceData.recentActivity.map((item) => (
                    <li key={item.id}>
                      <strong>{item.event}</strong> — {item.details || item.status} (
                      {formatDate(item.createdAt)})
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Upcoming Modules Grid */}
          <section className="dashboard-section" aria-labelledby="upcoming-modules-heading">
            <div className="dashboard-section__header">
              <div>
                <h2 id="upcoming-modules-heading">Planned Trading &amp; Research Modules</h2>
                <p className="dashboard-section__subtitle">
                  Preview the modules scheduled for integration into your Nexora workspace.
                </p>
              </div>
              {isLoadingWorkspace && (
                <span className="dashboard-loading-pill">Syncing status...</span>
              )}
            </div>

            <div className="dashboard-modules-grid">
              {modules.map((mod) => (
                <article key={mod.id} className="dashboard-module-card">
                  <div className="dashboard-module-card__top">
                    <span className="dashboard-module-card__category">
                      {mod.category}
                    </span>
                    <span className="badge badge--planned">{mod.status}</span>
                  </div>

                  <h3 className="dashboard-module-card__title">{mod.title}</h3>
                  <p className="dashboard-module-card__desc">{mod.description}</p>

                  <div className="dashboard-module-card__footer">
                    <span className="dashboard-module-card__availability">
                      <span className="status-dot status-dot--muted" aria-hidden="true" />
                      Not yet enabled in Phase 1
                    </span>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => setActiveTab(mod.id)}
                    >
                      Inspect Spec
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
