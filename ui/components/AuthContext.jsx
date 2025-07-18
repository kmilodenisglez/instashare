'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '../lib/api';
import { API_CONFIG } from '../lib/config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info from backend
  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH_USER);
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Login function
  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    try {
      const res = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN_LOCAL, formData);
      if (res.ok) {
        await fetchUser();
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  // Register function
  const register = async (email, password, name) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    if (name) formData.append('name', name);
    try {
      const res = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH_REGISTER, formData);
      if (res.ok) {
        await fetchUser();
        return { success: true };
      } else {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.detail || 'Registration failed. Email may already be in use.' };
      }
    } catch (e) {
      // Here you can access e.data.detail if it exists
      return { success: false, error: e.data?.detail || 'Registration failed. Email may already be in use.' };
    }
  };

  // Logout function
  const logout = async () => {
    await apiClient.post(API_CONFIG.ENDPOINTS.AUTH_LOGOUT);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}