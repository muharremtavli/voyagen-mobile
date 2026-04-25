/**
 * VoyaGen — Authentication Context
 *
 * Provides global auth state management with JWT token persistence
 * via expo-secure-store (native) or localStorage (web).
 *
 * Exports: AuthProvider, useAuth hook.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY, setLogoutCallback } from '../api/client';
import * as authApi from '../api/auth';
import * as usersApi from '../api/users';

const AuthContext = createContext(null);

// ── Token Helpers (cross-platform) ────────────────────────
const storeToken = async (token) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
};

const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

const removeToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};

// ── Auth Provider ─────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Logout function
  const logout = useCallback(async () => {
    await removeToken();
    setToken(null);
    setUser(null);
  }, []);

  // Register interceptor logout callback
  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  // Check for existing token on mount
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          setToken(storedToken);
          // Validate token by fetching user profile
          const profile = await usersApi.getMyProfile();
          setUser(profile);
        }
      } catch (error) {
        console.log('Token expired or invalid, clearing auth state');
        await removeToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  // Login
  const login = async (username, password) => {
    const data = await authApi.login({ username, password });
    const accessToken = data.access_token;

    await storeToken(accessToken);
    setToken(accessToken);

    // Fetch user profile
    const profile = await usersApi.getMyProfile();
    setUser(profile);

    return profile;
  };

  // Register (auto-login after registration)
  const register = async ({ email, username, full_name, password }) => {
    await authApi.register({ email, username, full_name, password });
    // Auto-login after successful registration
    return await login(username, password);
  };

  // Refresh user profile
  const refreshUser = async () => {
    try {
      const profile = await usersApi.getMyProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.log('Failed to refresh user profile:', error);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ── Hook ──────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
