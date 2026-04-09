import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const validation = {
  fullName: (v: string) => {
    const trimmed = v.trim();
    if (!trimmed) return 'Full name is required';
    if (!/^([A-Z][a-zA-Z]*)( [A-Z][a-zA-Z]*)*$/.test(trimmed)) return 'Use capitalized words (e.g. John Doe)';
    return null;
  },
  email: (v: string) => {
    if (!v.trim()) return 'Email is required';
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|org|in)$/.test(v)) return 'Use a valid .com, .org or .in email';
    return null;
  },
  username: (v: string) => {
    if (!v.trim()) return 'Username is required';
    if (!/^[a-z0-9._-]{3,50}$/.test(v)) return '3–50 chars: lowercase, digits, . _ - only';
    return null;
  },
  password: (v: string) => {
    if (!v) return 'Password is required';
    if (v.length < 8 || v.length > 16) return 'Password must be 8–16 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(v)) return 'Include upper, lower, digit and special character';
    return null;
  },
  confirmPassword: (p: string, c: string) => (p === c && c ? null : 'Passwords do not match'),
};

export default function Register() {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    clearError();
  }, [fullName, email, username, password, confirmPassword, clearError]);

  const handleConfirmChange = (v: string) => {
    setConfirmPassword(v);
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword: validation.confirmPassword(password, v) ?? '',
    }));
  };

  const handlePasswordChange = (v: string) => {
    setPassword(v);
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword: validation.confirmPassword(v, confirmPassword) ?? '',
    }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setProfilePictureUrl(typeof result === 'string' ? result : null);
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    const fn = validation.fullName(fullName);
    const em = validation.email(email);
    const un = validation.username(username);
    const pw = validation.password(password);
    const cp = validation.confirmPassword(password, confirmPassword);
    if (fn) err.fullName = fn;
    if (em) err.email = em;
    if (un) err.username = un;
    if (pw) err.password = pw;
    if (cp) err.confirmPassword = cp;
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    if (!validate()) return;
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
        confirmPassword,
        bio: bio.trim() || undefined,
        profilePictureUrl: profilePictureUrl || undefined,
      });
      setSuccessMessage('Account created successfully! Redirecting…');
      setTimeout(() => navigate('/home'), 1500);
    } catch {
      // error set in context
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5"
         style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #fce7f3 100%)' }}>
      <div className="container">
        <div className="auth-card" style={{ maxWidth: '480px' }}>
          {/* Logo */}
          <div className="text-center mb-4">
            <Link to="/" className="text-decoration-none">
              <h1 className="text-gradient fw-bold mb-0" style={{ fontFamily: 'Pacifico, cursive', fontSize: '2.5rem' }}>
                Instagram
              </h1>
            </Link>
            <p className="text-muted mt-2 mb-0">Sign up to see photos and videos from your friends.</p>
          </div>

          <div className="card">
            <div className="card-body">
              <h2 className="card-title">Create Account</h2>
              
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
                <div className="row">
                  <div className="col-12 mb-3">
                    <label htmlFor="fullName" className="form-label">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      className={`form-control ${fieldErrors.fullName ? 'is-invalid' : ''}`}
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                      }}
                      placeholder="John Doe"
                    />
                    {fieldErrors.fullName && <div className="invalid-feedback">{fieldErrors.fullName}</div>}
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      id="email"
                      type="email"
                      className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="you@example.com"
                    />
                    {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      id="username"
                      type="text"
                      className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: '' }));
                      }}
                      placeholder="johndoe"
                    />
                    {fieldErrors.username && <div className="invalid-feedback">{fieldErrors.username}</div>}
                  </div>
                </div>

                {/* Profile Picture Upload */}
                <div className="mb-3">
                  <label className="form-label">Profile Picture <span className="text-muted">(optional)</span></label>
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ 
                        width: 64, 
                        height: 64, 
                        background: profilePictureUrl ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      {profilePictureUrl ? (
                        <img src={profilePictureUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" viewBox="0 0 16 16">
                          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                          <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <input 
                        type="file" 
                        className="form-control form-control-sm" 
                        accept="image/*" 
                        onChange={handleProfilePictureChange} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">Bio <span className="text-muted">(optional)</span></label>
                  <textarea
                    id="bio"
                    className="form-control"
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    maxLength={255}
                  />
                  <div className="d-flex justify-content-end">
                    <small className="text-muted">{bio.length}/255</small>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      id="password"
                      type="password"
                      className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      maxLength={16}
                    />
                    {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className={`form-control ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                      value={confirmPassword}
                      onChange={(e) => handleConfirmChange(e.target.value)}
                      placeholder="••••••••"
                    />
                    {fieldErrors.confirmPassword && <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>}
                  </div>
                </div>
                
                <small className="text-muted d-block mb-3">
                  Password: 8–16 characters with uppercase, lowercase, number, and special character.
                </small>
                
                <button type="submit" className="btn btn-primary w-100 py-3 mb-3" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
                
                <p className="text-center text-muted small mb-0">
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>
          </div>
          
          {/* Login link */}
          <div className="card mt-3">
            <div className="card-body py-3 text-center">
              <span className="text-muted">Already have an account? </span>
              <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                Sign In
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
