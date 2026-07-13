'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Dummy credentials ────────────────────────────────────────────────────────
const DUMMY_USER = 'admin';
const DUMMY_PASS = 'finance@123';
const AUTH_KEY   = 'fl_auth_token';
const TOKEN      = 'fl_authenticated_v1';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading]             = useState(true);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      setIsAuthenticated(stored === TOKEN);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    // Simulate a brief network latency (feels real)
    await new Promise(res => setTimeout(res, 700));

    if (username.trim() === DUMMY_USER && password === DUMMY_PASS) {
      localStorage.setItem(AUTH_KEY, TOKEN);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password.' };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
