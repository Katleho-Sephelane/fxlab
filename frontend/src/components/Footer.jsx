import React from 'react';
import { Link } from 'react-router-dom';
import NexoraLogo from './NexoraLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand-col">
            <Link to="/" className="site-header__brand-link">
              <NexoraLogo
                size={34}
                showWordmark={true}
                subtitle="Trading Technology & Research"
              />
            </Link>
            <p className="site-footer__desc">
              Nexora is an early-stage trading technology platform focused on structured
              market research, historical strategy validation, execution analytics, and
              future AI-assisted workflow tooling.
            </p>
            <div className="site-footer__phase-badge">
              <span className="status-dot status-dot--blue" aria-hidden="true" />
              Phase 1 Release — Account &amp; Workspace Foundation
            </div>
          </div>

          <div className="site-footer__col">
            <h3 className="site-footer__heading">Platform</h3>
            <ul className="site-footer__list">
              <li>
                <a href="/#capabilities" className="site-footer__link">
                  Planned Capabilities
                </a>
              </li>
              <li>
                <a href="/#roadmap" className="site-footer__link">
                  Development Roadmap
                </a>
              </li>
              <li>
                <a href="/#architecture" className="site-footer__link">
                  Security Standards
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="site-footer__link">
                  Member Workspace
                </Link>
              </li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h3 className="site-footer__heading">Account &amp; Legal</h3>
            <ul className="site-footer__list">
              <li>
                <Link to="/register" className="site-footer__link">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="site-footer__link">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="site-footer__link">
                  Privacy Policy (Initial Draft)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="site-footer__link">
                  Terms of Use (Initial Draft)
                </Link>
              </li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h3 className="site-footer__heading">Contact &amp; Inquiries</h3>
            <p className="site-footer__contact-text">
              Have questions regarding platform development, research access, or security?
            </p>
            <div className="site-footer__contact-box">
              <span className="site-footer__contact-label">Contact Placeholder</span>
              <span className="site-footer__contact-value">
                inquiries@nexora-trading.example
              </span>
              <span className="site-footer__contact-note">
                (Replace with live support inbox prior to public launch)
              </span>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__disclaimer">
            <strong>Important Notice:</strong> Nexora provides software tools in
            development for trading research and workflow organization. Nexora is not a
            broker-dealer, financial advisor, or execution venue, and nothing on this
            website constitutes financial, investment, or trading advice. Advanced
            charting, backtesting, and AI research modules described on this site are
            planned roadmap items and are not yet active.
          </p>
          <div className="site-footer__meta">
            <span>&copy; {currentYear} Nexora. All rights reserved.</span>
            <div className="site-footer__meta-links">
              <Link to="/privacy">Privacy Policy</Link>
              <span aria-hidden="true">&middot;</span>
              <Link to="/terms">Terms of Use</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
