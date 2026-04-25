/**
 * VoyaGen — Axios API Client
 *
 * Central HTTP client with JWT token management via SecureStore.
 * Request interceptor attaches the Bearer token automatically.
 * Response interceptor handles 401 errors globally.
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ── Base URL Configuration ────────────────────────────────
// For emulators:
//   Android emulator → 10.0.2.2 (maps to host localhost)
//   iOS simulator    → localhost
// For physical devices → use your local network IP (ipconfig / ifconfig)
const getBaseUrl = () => {
  // Change this to your computer's local IP for physical device testing
  const LOCAL_IP = '10.192.18.57';
  const PORT = '8000';

  if (Platform.OS === 'android') {
    // If running on Android emulator, use 10.0.2.2
    // For physical device, use LOCAL_IP
    return `http://${LOCAL_IP}:${PORT}/api/v1`;
  }

  if (Platform.OS === 'web') {
    return `http://localhost:${PORT}/api/v1`;
  }

  // iOS simulator or physical device
  return `http://${LOCAL_IP}:${PORT}/api/v1`;
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Token Key ─────────────────────────────────────────────
export const TOKEN_KEY = 'voyagen_jwt_token';

// ── Request Interceptor ───────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    try {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem(TOKEN_KEY);
      } else {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error reading token from store:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────
// Logout callback (will be set by AuthContext)
let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && logoutCallback) {
      logoutCallback();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
