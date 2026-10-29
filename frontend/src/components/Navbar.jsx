import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import NexoraLogo from './NexoraLogo';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setMobileMenuOpen(false);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand-link" onClick={closeMenu}>
          <NexoraLogo size={36} showWordmark={true} />
        </Link>

        <nav className="site-nav-desktop" aria-label="Primary Navigation">
          <a href="/#capabilities" className="site-nav__link">
            Platform Vision
          </a>
          <a href="/#roadmap" className="site-nav__link">
            Roadmap
          </a>
          <a href="/#architecture" className="site-nav__link">
            Security &amp; Architecture
          </a>
          <NavLink to="/privacy" className="site-nav__link">
            Privacy
          </NavLink>
          <NavLink to="/terms" className="site-nav__link">
            Terms
          </NavLink>
        </nav>

        <div className="site-header__actions">
          {isAuthenticated ? (
            <>
              <span className="site-header__user-pill" title={user?.email}>
                <span className="status-dot status-dot--online" aria-hidden="true" />
                {user?.name}
              </span>
              <Link to="/dashboard" className="btn btn--secondary btn--sm">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="btn btn--ghost btn--sm"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm">
                Sign in
              </Link>
              <Link to="/register" className="btn btn--primary btn--sm">
                Create account
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <span className="mobile-menu-toggle__bar" />
          <span className="mobile-menu-toggle__bar" />
          <span className="mobile-menu-toggle__bar" />
        </button>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="mobile-nav-drawer">
          <nav className="container mobile-nav-drawer__inner" aria-label="Mobile Navigation">
            <a href="/#capabilities" className="mobile-nav__link" onClick={closeMenu}>
              Platform Vision
            </a>
            <a href="/#roadmap" className="mobile-nav__link" onClick={closeMenu}>
              Product Roadmap
            </a>
            <a href="/#architecture" className="mobile-nav__link" onClick={closeMenu}>
              Security &amp; Architecture
            </a>
            <Link to="/privacy" className="mobile-nav__link" onClick={closeMenu}>
              Privacy Policy
            </Link>
            <Link to="/terms" className="mobile-nav__link" onClick={closeMenu}>
              Terms of Use
            </Link>

            <div className="mobile-nav__actions">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="btn btn--primary btn--full"
                    onClick={closeMenu}
                  >
                    Open Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="btn btn--secondary btn--full"
                  >
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn btn--primary btn--full"
                    onClick={closeMenu}
                  >
                    Create account
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn--secondary btn--full"
                    onClick={closeMenu}
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
