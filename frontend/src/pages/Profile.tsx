import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { usersApi, postsApi, followApi, getMediaUrl } from '../services/api';
import type { ProfileStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Post, User } from '../types';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const [followSuccess, setFollowSuccess] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({});

  const userId = id ? Number(id) : null;
  const isSelf = currentUser && userId === currentUser.id;

  const loadLikedPosts = useCallback(async () => {
    if (!currentUser) return;
    try {
      const { data } = await postsApi.getLikedPostIds(currentUser.id);
      setLikedIds(new Set(data));
    } catch {
      // ignore
    }
  }, [currentUser]);

  const load = useCallback(async () => {
    if (userId == null || isNaN(userId)) return;
    setLoading(true);
    setError(null);
    try {
      const [userRes, statsRes, feedRes] = await Promise.all([
        usersApi.getById(userId),
        usersApi.getProfileStats(userId),
        postsApi.feed(userId, currentUser?.id),
      ]);
      setProfile(userRes.data);
      setStats(statsRes.data);
      setPosts(feedRes.data);
      await loadLikedPosts();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to load profile';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser?.id, loadLikedPosts]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFollow = async () => {
    if (!currentUser || !profile || isSelf) return;
    setFollowError(null);
    setFollowSuccess(null);
    setFollowLoading(true);
    try {
      await followApi.follow(currentUser.id, profile.id);
      setFollowSuccess('You are now following @' + profile.username + '.');
      setTimeout(() => setFollowSuccess(null), 3000);
      if (stats) setStats({ ...stats, followerCount: stats.followerCount + 1 });
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Follow failed';
      setFollowError(msg);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || !profile || isSelf) return;
    setFollowError(null);
    setFollowSuccess(null);
    setFollowLoading(true);
    try {
      await followApi.unfollow(currentUser.id, profile.id);
      setFollowSuccess('You unfollowed @' + profile.username + '.');
      setTimeout(() => setFollowSuccess(null), 3000);
      if (stats) setStats({ ...stats, followerCount: Math.max(0, stats.followerCount - 1) });
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Unfollow failed';
      setFollowError(msg);
    } finally {
      setFollowLoading(false);
    }
  };

  const validatePasswordForm = (): boolean => {
    const err: Record<string, string> = {};
    if (!oldPassword.trim()) err.oldPassword = 'Current password is required.';
    if (!newPassword) err.newPassword = 'New password is required.';
    else if (newPassword.length < 8 || newPassword.length > 16) err.newPassword = 'New password must be 8–16 characters.';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(newPassword)) err.newPassword = 'Include upper, lower, digit and special character.';
    if (newPassword !== confirmNewPassword) err.confirmNewPassword = 'New password and confirm password do not match.';
    else if (!confirmNewPassword) err.confirmNewPassword = 'Please confirm your new password.';
    setPasswordFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordFieldErrors({});
    if (!validatePasswordForm()) return;
    if (!currentUser || currentUser.id !== userId) return;
    setPasswordLoading(true);
    try {
      await usersApi.updatePassword(currentUser.id, { oldPassword, newPassword });
      setPasswordSuccess('Password updated successfully. You can close this form.');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(null);
      }, 4000);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to update password. Please check your current password and try again.';
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!currentUser) return;
    try {
      await postsApi.like(postId, currentUser.id);
      setLikedIds((s) => new Set(s).add(postId));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likeCount: p.likeCount + 1 } : p))
      );
    } catch {
      // ignore
    }
  };

  const handleUnlike = async (postId: number) => {
    if (!currentUser) return;
    try {
      await postsApi.unlike(postId, currentUser.id);
      setLikedIds((s) => {
        const next = new Set(s);
        next.delete(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likeCount: Math.max(0, p.likeCount - 1) } : p
        )
      );
    } catch {
      // ignore
    }
  };

  const profilePhotoSrc = profile?.profilePictureUrl
    ? profile.profilePictureUrl.startsWith('http') || profile.profilePictureUrl.startsWith('data:')
      ? profile.profilePictureUrl
      : getMediaUrl(profile.profilePictureUrl)
    : null;

  if (!currentUser) return null;

  return (
    <Layout>
      {loading && <p className="text-muted">Loading…</p>}
      {error && (
        <div className="alert alert-warning py-2" role="alert">
          {error}
        </div>
      )}
      {!loading && profile && (
        <>
          <div className="card mb-4 profile-header">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                {/* Profile Avatar */}
                <div
                  className="profile-avatar-large d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ 
                    background: profilePhotoSrc ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {profilePhotoSrc ? (
                    <img
                      src={profilePhotoSrc}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '3.5rem', fontWeight: 600 }}>{profile.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                
                {/* Profile Info */}
                <div className="flex-grow-1 text-center text-md-start">
                  <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-3 mb-3">
                    <h1 className="h4 mb-0 fw-normal">@{profile.username}</h1>
                    {isSelf && (
                      <>
                        <Link to="/edit-profile" className="btn btn-outline-primary btn-sm px-3" style={{ borderRadius: '8px' }}>
                          Edit Profile
                        </Link>
                        <Link to="/my-posts" className="btn btn-outline-secondary btn-sm px-3" style={{ borderRadius: '8px' }}>
                          My Posts
                        </Link>
                      </>
                    )}
                    {!isSelf && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm px-4"
                          onClick={handleFollow}
                          disabled={followLoading}
                          style={{ borderRadius: '8px' }}
                        >
                          Follow
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm px-3"
                          onClick={handleUnfollow}
                          disabled={followLoading}
                          style={{ borderRadius: '8px' }}
                        >
                          Unfollow
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Stats */}
                  {stats != null && (
                    <div className="profile-stats justify-content-center justify-content-md-start mb-3">
                      <div className="profile-stat">
                        <span className="profile-stat-number">{stats.postCount}</span>
                        <span className="profile-stat-label">posts</span>
                      </div>
                      <div className="profile-stat">
                        <span className="profile-stat-number">{stats.followerCount}</span>
                        <span className="profile-stat-label">followers</span>
                      </div>
                      <div className="profile-stat">
                        <span className="profile-stat-number">{stats.followingCount}</span>
                        <span className="profile-stat-label">following</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Bio */}
                  {profile.fullName && (
                    <p className="fw-semibold mb-1">{profile.fullName}</p>
                  )}
                  {profile.bio && <p className="text-muted mb-0" style={{ maxWidth: '400px' }}>{profile.bio}</p>}
                </div>
              </div>
              {followSuccess && (
                <div className="alert alert-success py-2 mt-2 mb-0" role="alert">
                  {followSuccess}
                </div>
              )}
              {followError && (
                <div className="alert alert-danger py-2 mt-2 mb-0" role="alert">
                  {followError}
                </div>
              )}

              {isSelf && (
                <div className="mt-4 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowPasswordForm((v) => !v)}
                  >
                    {showPasswordForm ? 'Cancel' : 'Update Password'}
                  </button>
                  {showPasswordForm && (
                    <form onSubmit={handleUpdatePassword} className="mt-3 p-3 bg-light rounded">
                      <h6 className="mb-3">Update Password</h6>
                      {passwordError && (
                        <div className="alert alert-danger py-2 small mb-3" role="alert">
                          {passwordError}
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="alert alert-success py-2 small mb-3" role="alert">
                          {passwordSuccess}
                        </div>
                      )}
                      <div className="mb-2">
                        <label className="form-label small">Current password <span className="text-danger">*</span></label>
                        <input
                          type="password"
                          className={`form-control form-control-sm ${passwordFieldErrors.oldPassword ? 'is-invalid' : ''}`}
                          value={oldPassword}
                          onChange={(e) => {
                            setOldPassword(e.target.value);
                            if (passwordFieldErrors.oldPassword) setPasswordFieldErrors((p) => ({ ...p, oldPassword: '' }));
                          }}
                          placeholder="Enter current password"
                          autoComplete="current-password"
                        />
                        {passwordFieldErrors.oldPassword && (
                          <div className="invalid-feedback">{passwordFieldErrors.oldPassword}</div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label small">New password <span className="text-danger">*</span></label>
                        <input
                          type="password"
                          className={`form-control form-control-sm ${passwordFieldErrors.newPassword ? 'is-invalid' : ''}`}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (passwordFieldErrors.newPassword) setPasswordFieldErrors((p) => ({ ...p, newPassword: '' }));
                            if (passwordFieldErrors.confirmNewPassword && e.target.value === confirmNewPassword) setPasswordFieldErrors((p) => ({ ...p, confirmNewPassword: '' }));
                          }}
                          placeholder="8–16 chars, upper, lower, digit, special"
                          minLength={8}
                          maxLength={16}
                          autoComplete="new-password"
                        />
                        {passwordFieldErrors.newPassword && (
                          <div className="invalid-feedback">{passwordFieldErrors.newPassword}</div>
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="form-label small">Confirm new password <span className="text-danger">*</span></label>
                        <input
                          type="password"
                          className={`form-control form-control-sm ${passwordFieldErrors.confirmNewPassword ? 'is-invalid' : ''}`}
                          value={confirmNewPassword}
                          onChange={(e) => {
                            setConfirmNewPassword(e.target.value);
                            if (passwordFieldErrors.confirmNewPassword) setPasswordFieldErrors((p) => ({ ...p, confirmNewPassword: '' }));
                          }}
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                        />
                        {passwordFieldErrors.confirmNewPassword && (
                          <div className="invalid-feedback">{passwordFieldErrors.confirmNewPassword}</div>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? 'Updating…' : 'Update Password'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
          <h3 className="h6 mb-3">Posts</h3>
          {posts.length === 0 ? (
            <p className="text-muted small">No posts yet.</p>
          ) : (
            posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                currentUserId={currentUser.id}
                onLike={handleLike}
                onUnlike={handleUnlike}
                liked={likedIds.has(p.id)}
              />
            ))
          )}
        </>
      )}
    </Layout>
  );
}
