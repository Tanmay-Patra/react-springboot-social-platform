import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { searchApi, postsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Post, User } from '../types';

type Tab = 'users' | 'hashtags';

export default function Search() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('users');
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const loadLikedPosts = async () => {
    if (!user) return;
    try {
      const { data } = await postsApi.getLikedPostIds(user.id);
      setLikedIds(new Set(data));
    } catch {
      // ignore
    }
  };

  const search = async () => {
    const term = q.trim();
    if (!term) return;
    setError(null);
    setLoading(true);
    try {
      if (tab === 'users') {
        const { data } = await searchApi.users(term);
        setUsers(data);
        setPosts([]);
      } else {
        const { data } = await searchApi.hashtags(term.replace(/^#/, ''), user?.id);
        setPosts(data);
        setUsers([]);
        await loadLikedPosts();
      }
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Search failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!user) return;
    try {
      await postsApi.like(postId, user.id);
      setLikedIds((s) => new Set(s).add(postId));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likeCount: p.likeCount + 1 } : p))
      );
    } catch {
      // ignore
    }
  };

  const handleUnlike = async (postId: number) => {
    if (!user) return;
    try {
      await postsApi.unlike(postId, user.id);
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

  return (
    <>
      <h1 className="h4 mb-4">Search</h1>
      <div className="mb-3">
        <div className="btn-group mb-2">
          <button
            type="button"
            className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setTab('users')}
          >
            Users
          </button>
          <button
            type="button"
            className={`btn ${tab === 'hashtags' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setTab('hashtags')}
          >
            Hashtags
          </button>
        </div>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder={tab === 'users' ? 'Username…' : 'Hashtag (e.g. travel)…'}
          />
          <button type="button" className="btn btn-primary" onClick={search} disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </div>
      {error && (
        <div className="alert alert-warning py-2 mb-3" role="alert">
          {error}
        </div>
      )}
      {tab === 'users' && (
        <div className="list-group">
          {users.length === 0 && !loading && q.trim() && (
            <p className="text-muted small">No users found.</p>
          )}
          {users.map((u) => (
            <Link
              key={u.id}
              to={`/profile/${u.id}`}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            >
              <div>
                <span className="fw-semibold">@{u.username}</span>
                {u.fullName && <span className="text-muted ms-2">{u.fullName}</span>}
              </div>
              <span className="badge bg-secondary">View profile</span>
            </Link>
          ))}
        </div>
      )}
      {tab === 'hashtags' && (
        <>
          {posts.length === 0 && !loading && q.trim() && (
            <p className="text-muted small">No posts for this hashtag.</p>
          )}
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              currentUserId={user?.id}
              onLike={handleLike}
              onUnlike={handleUnlike}
              liked={likedIds.has(p.id)}
            />
          ))}
        </>
      )}
    </>
  );
}
