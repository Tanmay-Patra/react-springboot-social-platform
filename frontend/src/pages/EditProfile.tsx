import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';

export default function EditProfile() {
  const { user: currentUser, setUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setFullName(currentUser.fullName || '');
    setBio(currentUser.bio || '');
    setProfilePictureUrl(currentUser.profilePictureUrl || null);
  }, [currentUser]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const { data } = await usersApi.updateProfile(currentUser.id, {
        fullName: fullName.trim() || undefined,
        bio: bio.trim() || undefined,
        profilePictureUrl: profilePictureUrl == null ? undefined : profilePictureUrl,
      });
      setUser(data);
      setSuccess(true);
      setTimeout(() => navigate(`/profile/${currentUser.id}`), 1500);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to update profile';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <Layout>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h2 className="h5 mb-4">Edit profile</h2>
          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success py-2" role="alert">
              Profile updated. Redirecting…
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Profile picture</label>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle overflow-hidden bg-secondary d-flex align-items-center justify-content-center text-white"
                  style={{ width: 80, height: 80 }}
                >
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span className="small">No photo</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                  {profilePictureUrl && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm mt-2"
                      onClick={() => setProfilePictureUrl('')}
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="editFullName" className="form-label">Full name</label>
              <input
                id="editFullName"
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="editBio" className="form-label">Bio</label>
              <textarea
                id="editBio"
                className="form-control"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short bio..."
                maxLength={255}
              />
              <small className="text-muted">{bio.length}/255</small>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving…' : 'Save changes'}
              </button>
              <Link to={`/profile/${currentUser.id}`} className="btn btn-outline-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
