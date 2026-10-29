import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main className="legal-section">
        <div className="container legal-container">
          <div className="legal-draft-banner" role="note">
            <strong>Initial Draft Notice:</strong> This Privacy Policy is an initial
            working draft prepared for the Phase 1 technical release of the Nexora website
            and authentication workspace. It does not constitute legal advice or verified
            regulatory compliance and must be reviewed and finalized by qualified legal
            counsel prior to commercial launch.
          </div>

          <header className="legal-header">
            <span className="section-eyebrow">Legal &amp; Governance Draft</span>
            <h1 className="legal-title">Privacy Policy (Initial Draft)</h1>
            <p className="legal-meta">Last Updated: Phase 1 Initial Release</p>
          </header>

          <div className="legal-prose">
            <section>
              <h2>1. Scope &amp; Purpose</h2>
              <p>
                This initial draft Privacy Policy describes how the Nexora platform
                (&ldquo;Nexora&rdquo;) collects, uses, and protects personal account
                information during its Phase 1 website and member workspace release.
              </p>
            </section>

            <section>
              <h2>2. Information Collected</h2>
              <p>
                When you register for or sign in to a Nexora account, we collect only the
                minimum information required to provision and secure your workspace:
              </p>
              <ul>
                <li>
                  <strong>Account Identity Data:</strong> Your name and email address.
                </li>
                <li>
                  <strong>Authentication Credentials:</strong> Your password is never
                  stored in plaintext; it is cryptographically hashed using bcrypt prior
                  to storage in our database.
                </li>
                <li>
                  <strong>Security &amp; Session Metadata:</strong> Account creation
                  timestamps, most recent login timestamps, and temporary rate-limiting
                  counters used to protect against automated credential attacks.
                </li>
              </ul>
            </section>

            <section>
              <h2>3. Cookies &amp; Session Management</h2>
              <p>
                Nexora uses strictly necessary HTTP-only authentication cookies
                (<code>nexora_access_token</code>) and Cross-Site Request Forgery
                protection cookies (<code>nexora_csrf_token</code>) to maintain your
                signed-in session securely. We do not store authentication tokens in
                browser <code>localStorage</code>, and Phase 1 does not deploy third-party
                advertising or behavioral tracking cookies.
              </p>
            </section>

            <section>
              <h2>4. How Information Is Used</h2>
              <p>We use your information exclusively to:</p>
              <ul>
                <li>Authenticate your identity and provide access to your dashboard.</li>
                <li>Protect the platform against unauthorized access or abuse.</li>
                <li>
                  Communicate essential account or service updates related to the Nexora
                  platform.
                </li>
              </ul>
            </section>

            <section>
              <h2>5. Data Storage &amp; Security Controls</h2>
              <p>
                Account records are stored in a managed MongoDB Atlas database configured
                with encrypted transport (TLS), role-based access controls, and strict
                input validation. While we implement industry-standard safeguards, no
                internet transmission or electronic storage system can be guaranteed to be
                100% impenetrable.
              </p>
            </section>

            <section>
              <h2>6. Contact &amp; Updates</h2>
              <p>
                Prior to commercial launch, the project operator will publish formal data
                controller details and a dedicated privacy contact inbox. For development
                phase inquiries, please use the contact placeholder listed in the website
                footer.
              </p>
            </section>
          </div>

          <div className="legal-footer-nav">
            <Link to="/" className="btn btn--secondary btn--sm">
              &larr; Back to Home
            </Link>
            <Link to="/terms" className="btn btn--ghost btn--sm">
              View Terms of Use (Initial Draft) &rarr;
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
