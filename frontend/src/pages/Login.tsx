import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const validation = {
  username: (v: string) => (v.trim() ? null : 'Username is required'),
  password: (v: string) => (v ? null : 'Password is required'),
};

export default function Login() {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { fromLogout?: boolean } | null;
    if (state?.fromLogout) {
      setSuccessMessage('You have been logged out successfully.');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    clearError();
  }, [username, password, clearError]);

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    const u = validation.username(username);
    const p = validation.password(password);
    if (u) err.username = u;
    if (p) err.password = p;
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    if (!validate()) return;
    try {
      await login(username.trim(), password);
      navigate('/home');
    } catch {
      // error set in context
    }
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
              <h2 className="card-title">Welcome Back</h2>
              <p className="text-center text-muted mb-4">Sign in to continue to your account</p>
              
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
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: '' }));
                    }}
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                  {fieldErrors.username && (
                    <div className="invalid-feedback">{fieldErrors.username}</div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  {fieldErrors.password && (
                    <div className="invalid-feedback">{fieldErrors.password}</div>
                  )}
                </div>
                
                <button type="submit" className="btn btn-primary w-100 py-3 mb-3" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
                
                <div className="text-center">
                  <Link to="/forgot-password" className="text-primary text-decoration-none small">
                    Forgot your password?
                  </Link>
                </div>
              </form>
            </div>
          </div>
          
          {/* Sign up link */}
          <div className="card mt-3">
            <div className="card-body py-3 text-center">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                Sign Up
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
