import React, { createContext, useCallback, useContext, useState } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    profilePictureUrl?: string;
    bio?: string;
  }) => Promise<void>;
  logout: () => void;
  setUser: (u: User | null) => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authApi.login({ username, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: {
      fullName: string;
      email: string;
      username: string;
      password: string;
      confirmPassword: string;
      profilePictureUrl?: string;
      bio?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const { data: u } = await authApi.register(data);
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (e as Error)?.message ||
          'Registration failed';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
