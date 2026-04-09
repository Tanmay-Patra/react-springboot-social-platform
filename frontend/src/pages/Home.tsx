import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { postsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const loadLikedPosts = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await postsApi.getLikedPostIds(user.id);
      setLikedIds(new Set(data));
    } catch {
      // ignore
    }
  }, [user]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [postsRes] = await Promise.all([
        postsApi.homeFeed(user.id),
      ]);
      setPosts(postsRes.data);
      await loadLikedPosts();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to load feed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user, loadLikedPosts]);

  useEffect(() => {
    load();
  }, [load]);

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

  if (!user) return null;

  return (
    <Layout>
      <h1 className="h4 mb-4">Home</h1>
      <p className="text-muted small mb-3">Your posts and posts from people you follow.</p>
      {loading && <p className="text-muted">Loading…</p>}
      {error && (
        <div className="alert alert-warning py-2" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && posts.length === 0 && (
        <p className="text-muted">No posts in your feed yet. Create one, follow people, or explore trending.</p>
      )}
      {!loading &&
        !error &&
        posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            currentUserId={user.id}
            onLike={handleLike}
            onUnlike={handleUnlike}
            liked={likedIds.has(p.id)}
          />
        ))}
    </Layout>
  );
}
