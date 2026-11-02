import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_KEY = 'fl_auth_token';
const TOKEN = 'fl_authenticated_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const authenticated = localStorage.getItem(AUTH_KEY) === TOKEN;
    setIsAuthenticated(authenticated);
    setUsername(authenticated ? 'admin' : '');
    setIsLoading(false);
  }, []);

  const login = async (user: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (user.trim() === 'admin' && password === 'finance@123') {
      localStorage.setItem(AUTH_KEY, TOKEN);
      setIsAuthenticated(true);
      setUsername('admin');
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password.' };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setUsername('');
  };

  return <AuthContext.Provider value={{ isAuthenticated, isLoading, username, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
