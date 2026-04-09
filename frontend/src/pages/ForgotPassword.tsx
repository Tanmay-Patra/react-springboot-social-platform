import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';

const validation = {
  email: (v: string) => (v.trim() ? null : 'Email is required'),
  password: (v: string) => {
    if (!v) return 'Password is required';
    if (v.length < 8 || v.length > 16) return 'Password must be 8–16 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(v)) return 'Include upper, lower, digit and special character';
    return null;
  },
  confirm: (p: string, c: string) => (p === c && c ? null : 'Passwords do not match'),
};

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleValidateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const err = validation.email(email);
    if (err) {
      setFieldErrors({ email: err });
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await authApi.validateEmail(email.trim());
      setSuccessMessage('');
      setStep('reset');
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'No account found with this email.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const pwErr = validation.password(newPassword);
    const cpErr = validation.confirm(newPassword, confirmPassword);
    const errs: Record<string, string> = {};
    if (pwErr) errs.newPassword = pwErr;
    if (cpErr) errs.confirmPassword = cpErr;
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await authApi.resetPasswordByEmail({ email: email.trim(), newPassword });
      setSuccessMessage('Password has been reset successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to reset password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmChange = (v: string) => {
    setConfirmPassword(v);
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword: validation.confirm(newPassword, v) ?? '',
    }));
  };

  const handleNewPasswordChange = (v: string) => {
    setNewPassword(v);
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword: validation.confirm(v, confirmPassword) ?? '',
    }));
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5"
         style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #fce7f3 100%)' }}>
      <div className="container">
        <div className="auth-card">
          {/* Logo */}
          <div className="text-center mb-4">
            <Link to="/" className="text-decoration-none">
              <h1 className="text-gradient fw-bold mb-0" style={{ fontFamily: 'Pacifico, cursive', fontSize: '2.5rem' }}>
                Instagram
              </h1>
            </Link>
          </div>

          <div className="card">
            <div className="card-body">
              {/* Lock Icon */}
              <div className="text-center mb-3">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{ 
                    width: 80, 
                    height: 80, 
                    border: '3px solid var(--color-text)',
                    opacity: 0.8
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  </svg>
                </div>
              </div>
              
              <h2 className="card-title" style={{ fontSize: '1.25rem' }}>
                {step === 'email' ? 'Trouble logging in?' : 'Create new password'}
              </h2>
              
              {successMessage && (
                <div className="alert alert-success py-2" role="alert">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}

              {step === 'email' ? (
                <>
                  <p className="text-muted small text-center mb-4">
                    Enter your email and we'll verify your account exists.
                  </p>
                  <form onSubmit={handleValidateEmail}>
                    <div className="mb-4">
                      <input
                        id="email"
                        type="email"
                        className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        placeholder="Email address"
                        autoComplete="email"
                      />
                      {fieldErrors.email && (
                        <div className="invalid-feedback">{fieldErrors.email}</div>
                      )}
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-3" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Verifying...
                        </>
                      ) : (
                        'Verify Email'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <p className="text-muted small text-center mb-4">
                    Account verified for <strong className="text-primary">{email}</strong>
                    <br />Enter your new password below.
                  </p>
                  <form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                      <input
                        id="newPassword"
                        type="password"
                        className={`form-control ${fieldErrors.newPassword ? 'is-invalid' : ''}`}
                        value={newPassword}
                        onChange={(e) => {
                          handleNewPasswordChange(e.target.value);
                          if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: '' }));
                        }}
                        placeholder="New password"
                        minLength={8}
                        maxLength={16}
                        autoComplete="new-password"
                      />
                      {fieldErrors.newPassword && (
                        <div className="invalid-feedback">{fieldErrors.newPassword}</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <input
                        id="confirmPassword"
                        type="password"
                        className={`form-control ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                        value={confirmPassword}
                        onChange={(e) => handleConfirmChange(e.target.value)}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                      {fieldErrors.confirmPassword && (
                        <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>
                      )}
                    </div>
                    <small className="text-muted d-block mb-3">
                      8–16 characters with uppercase, lowercase, number, and special character.
                    </small>
                    <button type="submit" className="btn btn-primary w-100 py-3" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </form>
                </>
              )}

              <div className="text-center mt-4">
                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1" />
                  <span className="px-3 text-muted small">OR</span>
                  <hr className="flex-grow-1" />
                </div>
                <Link to="/register" className="text-decoration-none fw-semibold">
                  Create new account
                </Link>
              </div>
            </div>
          </div>
          
          {/* Back to login */}
          <div className="card mt-3">
            <div className="card-body py-3 text-center">
              <Link to="/login" className="text-decoration-none">
                Back to Sign In
              </Link>
            </div>
          </div>
          
          {/* Back to home */}
          <div className="text-center mt-4">
            <Link to="/" className="text-muted text-decoration-none small">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
