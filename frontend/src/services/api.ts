import axios from 'axios';
import type { User, Post, FollowResponse, Comment } from '../types';

export const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

/** Use for media URLs that are stored as paths, load from the API server. */
export const getMediaUrl = (pathOrUrl: string): string =>
  pathOrUrl.startsWith('http') ? pathOrUrl : `${API_BASE}${pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl}`;

export const authApi = {
  register: (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    profilePictureUrl?: string;
    bio?: string;
  }) => api.post<User>('/api/auth/register', data),

  login: (data: { username: string; password: string }) =>
    api.post<User>('/api/auth/login', data),

  passwordResetRequest: (data: { email: string }) =>
    api.post('/api/auth/password/reset-request', data),

  passwordReset: (data: { token: string; newPassword: string }) =>
    api.post('/api/auth/password/reset', data),

  validateEmail: (email: string) =>
    api.post('/api/auth/password/validate-email', { email }),

  resetPasswordByEmail: (data: { email: string; newPassword: string }) =>
    api.post('/api/auth/password/reset-by-email', data),
};

export const postsApi = {
  create: (userId: number, data: { caption: string; mediaUrls: string[]; hashtags?: string[]; privacy?: string }) =>
    api.post<Post>(`/api/posts/${userId}`, data),

  createWithMedia: (userId: number, formData: FormData) =>
    api.post<Post>(`/api/posts/${userId}`, formData, {
      headers: { 'Content-Type': undefined },
    }),

  feed: (userId: number, viewerId?: number) =>
    api.get<Post[]>(`/api/posts/feed/${userId}`, { params: viewerId != null ? { viewerId } : {} }),

  homeFeed: (userId: number) =>
    api.get<Post[]>(`/api/posts/home-feed/${userId}`),

  searchHashtag: (hashtag: string, viewerId?: number) =>
    api.get<Post[]>(`/api/posts/search/hashtag`, { params: viewerId != null ? { hashtag, viewerId } : { hashtag } }),

  trending: (viewerId?: number) =>
    api.get<Post[]>(`/api/posts/trending`, { params: viewerId != null ? { viewerId } : {} }),

  delete: (userId: number, postId: number) =>
    api.delete(`/api/posts/${userId}/${postId}`),

  like: (postId: number, userId: number) =>
    api.post(`/api/posts/${postId}/like/${userId}`),

  unlike: (postId: number, userId: number) =>
    api.post(`/api/posts/${postId}/unlike/${userId}`),

  getLikedPostIds: (userId: number) =>
    api.get<number[]>(`/api/posts/liked/${userId}`),
};

export const commentsApi = {
  add: (userId: number, postId: number, text: string) =>
    api.post<Comment>(`/api/comments/${userId}/${postId}`, { text }),

  getByPost: (postId: number) =>
    api.get<Comment[]>(`/api/comments/post/${postId}`),

  delete: (userId: number, commentId: number) =>
    api.delete(`/api/comments/${userId}/${commentId}`),
};

export const followApi = {
  follow: (followerId: number, followingId: number) =>
    api.post<FollowResponse>(`/api/follow/${followerId}/${followingId}`),

  unfollow: (followerId: number, followingId: number) =>
    api.delete(`/api/follow/${followerId}/${followingId}`),
};

export const searchApi = {
  users: (q: string) => api.get<User[]>(`/api/search/users`, { params: { q } }),

  hashtags: (hashtag: string, viewerId?: number) =>
    api.get<Post[]>(`/api/search/hashtags`, { params: viewerId != null ? { hashtag, viewerId } : { hashtag } }),
};

export interface ProfileStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export const usersApi = {
  getById: (id: number) => api.get<User>(`/api/users/${id}`),

  getProfileStats: (id: number) => api.get<ProfileStats>(`/api/users/${id}/stats`),

  updateProfile: (id: number, data: { fullName?: string; profilePictureUrl?: string; bio?: string }) =>
    api.put<User>(`/api/users/${id}`, data),

  updatePassword: (id: number, data: { oldPassword: string; newPassword: string }) =>
    api.put(`/api/users/${id}/password`, data),
};

export default api;
