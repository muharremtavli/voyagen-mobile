/**
 * VoyaGen — Auth API Module
 *
 * Handles registration and login.
 * NOTE: Login endpoint uses OAuth2 form-data (application/x-www-form-urlencoded),
 * not JSON. This matches the FastAPI OAuth2PasswordRequestForm.
 */

import apiClient from './client';

/**
 * Register a new user.
 * @param {{ email: string, username: string, full_name: string, password: string }} data
 * @returns {Promise<object>} UserResponse
 */
export const register = async (data) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

/**
 * Login with username/email and password.
 * Uses x-www-form-urlencoded as required by FastAPI's OAuth2PasswordRequestForm.
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<{ access_token: string, token_type: string }>}
 */
export const login = async ({ username, password }) => {
  // Manual URL encoding for React Native compatibility
  // (URLSearchParams may not be available in all RN environments)
  const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

  const response = await apiClient.post('/auth/login', body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};
