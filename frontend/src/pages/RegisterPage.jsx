import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NexoraLogo from '../components/NexoraLogo';
import { useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = {
    minLength: formData.password.length >= 8,
    hasUpperAndLower:
      /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password),
    hasNumberOrSymbol: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password),
  };

  const validateClient = () => {
    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      errors.name = 'Please enter your full name.';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    } else if (trimmedName.length > 80) {
      errors.name = 'Name cannot exceed 80 characters.';
    }

    if (!trimmedEmail) {
      errors.email = 'Please enter your email address.';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Please create a password.';
    } else if (
      !passwordChecks.minLength ||
      !passwordChecks.hasUpperAndLower ||
      !passwordChecks.hasNumberOrSymbol
    ) {
      errors.password =
        'Password must be at least 8 characters and include uppercase, lowercase, and a number or symbol.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const validationErrors = validateClient();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMessage('Account created successfully. Redirecting to your workspace...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 450);
    } catch (err) {
      if (err.errors && typeof err.errors === 'object') {
        setFieldErrors(err.errors);
      }
      setServerError(
        err.message || 'Unable to complete registration. Please check your details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="auth-section">
        <div className="container auth-section__inner">
          <div className="auth-card">
            <div className="auth-card__header">
              <NexoraLogo size={40} showWordmark={false} />
              <h1 className="auth-card__title">Create your Nexora account</h1>
              <p className="auth-card__subtitle">
                Access your Phase 1 member workspace and follow upcoming trading research
                modules.
              </p>
            </div>

            {serverError && (
              <div className="alert alert--error" role="alert">
                <strong>Registration error:</strong> {serverError}
              </div>
            )}

            {successMessage && (
              <div className="alert alert--success" role="status">
                {successMessage}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="register-name" className="form-label">
                  Full name
                </label>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Elena Vance"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'register-name-error' : undefined}
                  className={`form-input ${fieldErrors.name ? 'form-input--error' : ''}`}
                />
                {fieldErrors.name && (
                  <p id="register-name-error" className="form-error">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="register-email" className="form-label">
                  Email address
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? 'register-email-error' : undefined
                  }
                  className={`form-input ${fieldErrors.email ? 'form-input--error' : ''}`}
                />
                {fieldErrors.email && (
                  <p id="register-email-error" className="form-error">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="register-password" className="form-label">
                    Password
                  </label>
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby="register-password-rules"
                  className={`form-input ${
                    fieldErrors.password ? 'form-input--error' : ''
                  }`}
                />
                {fieldErrors.password && (
                  <p className="form-error">{fieldErrors.password}</p>
                )}

                <ul
                  id="register-password-rules"
                  className="password-checklist"
                  aria-label="Password requirements"
                >
                  <li className={passwordChecks.minLength ? 'is-met' : ''}>
                    At least 8 characters
                  </li>
                  <li className={passwordChecks.hasUpperAndLower ? 'is-met' : ''}>
                    Uppercase &amp; lowercase letters
                  </li>
                  <li className={passwordChecks.hasNumberOrSymbol ? 'is-met' : ''}>
                    At least one number or symbol
                  </li>
                </ul>
              </div>

              <div className="form-group">
                <label htmlFor="register-confirm-password" className="form-label">
                  Confirm password
                </label>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={
                    fieldErrors.confirmPassword ? 'register-confirm-error' : undefined
                  }
                  className={`form-input ${
                    fieldErrors.confirmPassword ? 'form-input--error' : ''
                  }`}
                />
                {fieldErrors.confirmPassword && (
                  <p id="register-confirm-error" className="form-error">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn--primary btn--full btn--lg"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="auth-card__footer">
              <p>
                Already have a Nexora account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
              <p className="auth-card__legal-note">
                By creating an account, you acknowledge our{' '}
                <Link to="/terms">Terms of Use</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link> (initial drafts).
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
