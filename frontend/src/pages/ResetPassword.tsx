import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';

const validation = {
  newPassword: (v: string) => {
    if (!v) return 'Password is required';
    if (v.length < 8 || v.length > 16) return 'Password must be 8–16 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(v)) return 'Include upper, lower, digit and special character';
    return null;
  },
  confirm: (p: string, c: string) => (p === c && c ? null : 'Passwords do not match'),
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Missing reset token. Please use the link from your email or go to Forgot password.');
      return;
    }
    const pwErr = validation.newPassword(newPassword);
    const cpErr = validation.confirm(newPassword, confirm);
    const errs: Record<string, string> = {};
    if (pwErr) errs.newPassword = pwErr;
    if (cpErr) errs.confirm = cpErr;
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await authApi.passwordReset({ token, newPassword });
      setDone(true);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Reset failed. Token may be invalid or expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-vh-100 bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-5">
              <div className="card shadow">
                <div className="card-body p-4 text-center">
                  <div className="alert alert-success mb-3" role="alert">
                    Password has been reset successfully.
                  </div>
                  <Link to="/login" className="btn btn-primary">
                    Log in
                  </Link>
                  <p className="mt-3 mb-0 small">
                    <Link to="/">Back to home</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <p className="text-center mb-3">
          <Link to="/" className="fw-bold text-dark text-decoration-none">Instagram</Link>
        </p>
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card shadow">
              <div className="card-body p-4">
                <h2 className="card-title mb-4">Reset password</h2>
                {error && (
                  <div className="alert alert-danger py-2" role="alert">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">New password</label>
                    <input
                      id="newPassword"
                      type="password"
                      className={`form-control ${fieldErrors.newPassword ? 'is-invalid' : ''}`}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: '' }));
                      }}
                      placeholder="••••••••"
                      minLength={8}
                      maxLength={16}
                      autoComplete="new-password"
                    />
                    {fieldErrors.newPassword && (
                      <div className="invalid-feedback">{fieldErrors.newPassword}</div>
                    )}
                    <small className="text-muted">8–16 chars; upper, lower, digit, special.</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirm" className="form-label">Confirm password</label>
                    <input
                      id="confirm"
                      type="password"
                      className={`form-control ${fieldErrors.confirm ? 'is-invalid' : ''}`}
                      value={confirm}
                      onChange={(e) => {
                        setConfirm(e.target.value);
                        if (fieldErrors.confirm) setFieldErrors((prev) => ({ ...prev, confirm: '' }));
                      }}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    {fieldErrors.confirm && (
                      <div className="invalid-feedback">{fieldErrors.confirm}</div>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-2" disabled={loading || !token}>
                    {loading ? 'Resetting…' : 'Reset password'}
                  </button>
                  <p className="text-center mb-0 small">
                    <Link to="/login">Back to login</Link>
                  </p>
                  <p className="text-center mt-2 small">
                    <Link to="/forgot-password">Forgot password?</Link>
                  </p>
                  <p className="text-center mt-2 small">
                    <Link to="/">Back to home</Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
