import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main className="legal-section">
        <div className="container legal-container">
          <div className="legal-draft-banner" role="note">
            <strong>Initial Draft Notice:</strong> These Terms of Use are an initial
            working draft prepared for the Phase 1 technical release of the Nexora
            website. They do not constitute legal advice or verified regulatory compliance
            and must be reviewed by qualified legal counsel prior to public commercial
            operation.
          </div>

          <header className="legal-header">
            <span className="section-eyebrow">Legal &amp; Governance Draft</span>
            <h1 className="legal-title">Terms of Use (Initial Draft)</h1>
            <p className="legal-meta">Last Updated: Phase 1 Initial Release</p>
          </header>

          <div className="legal-prose">
            <section>
              <h2>1. Overview of the Phase 1 Service</h2>
              <p>
                Nexora (&ldquo;the Platform&rdquo;) is a trading technology and market
                research web application currently in Phase 1 development. During Phase 1,
                the Platform provides informational pages, account registration, secure
                sign-in, and a starter member workspace. Interactive charting, backtesting,
                execution analytics, and AI tools described on the website are planned
                roadmap features and are not yet active.
              </p>
            </section>

            <section>
              <h2>2. No Financial, Investment, or Trading Advice</h2>
              <p>
                Nexora is a software technology project and is <strong>not</strong> a
                financial advisor, registered investment advisor, broker-dealer, or
                commodity trading advisor. Nothing contained on the Nexora website or
                member dashboard constitutes a solicitation, recommendation, endorsement,
                or offer to buy or sell any financial instrument or security. Trading
                financial markets involves substantial risk of loss.
              </p>
            </section>

            <section>
              <h2>3. User Accounts &amp; Security Responsibilities</h2>
              <p>
                When creating an account on Nexora, you agree to provide accurate
                registration details and to maintain the confidentiality of your login
                credentials. You are responsible for all activities conducted under your
                account and must notify the platform operator promptly if you suspect
                unauthorized access.
              </p>
            </section>

            <section>
              <h2>4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>
                  Attempt to bypass authentication controls, rate limiters, or CSRF
                  protections.
                </li>
                <li>
                  Submit malicious payloads, automated credential-stuffing requests, or
                  disruptive traffic against the Nexora API.
                </li>
                <li>
                  Misrepresent your identity or affiliation when using the Platform.
                </li>
              </ul>
            </section>

            <section>
              <h2>5. Intellectual Property &amp; Third-Party Trademarks</h2>
              <p>
                The Nexora name, visual design, custom source code, and original copy are
                proprietary to the Nexora project. Any third-party product names or
                trademarks referenced in technical documentation remain the property of
                their respective owners. Nexora makes no claim of partnership, sponsorship,
                or endorsement by any third-party charting or market data provider.
              </p>
            </section>

            <section>
              <h2>6. Disclaimer of Warranties</h2>
              <p>
                The Phase 1 Platform is provided on an &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; basis for evaluation and early account onboarding, without
                warranties of any kind, whether express or implied.
              </p>
            </section>
          </div>

          <div className="legal-footer-nav">
            <Link to="/" className="btn btn--secondary btn--sm">
              &larr; Back to Home
            </Link>
            <Link to="/privacy" className="btn btn--ghost btn--sm">
              View Privacy Policy (Initial Draft) &rarr;
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
