import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { postsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types';

export default function MyPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await postsApi.feed(user.id, user.id);
      setPosts(data);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to load posts';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (postId: number) => {
    if (!user) return;
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await postsApi.delete(user.id, postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      // could toast
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <h1 className="h4 mb-4">My Posts</h1>
      <p className="text-muted small mb-3">Manage and delete your posts.</p>
      {loading && <p className="text-muted">Loading…</p>}
      {error && (
        <div className="alert alert-warning py-2" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && posts.length === 0 && (
        <p className="text-muted">You have no posts yet.</p>
      )}
      {!loading &&
        !error &&
        posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            showDelete
            onDelete={handleDelete}
          />
        ))}
    </Layout>
  );
}
