/**
 * VoyaGen — Users API Module
 *
 * Profile, follow/unfollow, search, and user listing endpoints.
 */

import apiClient from './client';

/** Get the current authenticated user's profile. */
export const getMyProfile = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

/** Update the current user's profile. */
export const updateProfile = async (data) => {
  const response = await apiClient.put('/users/me', data);
  return response.data;
};

/** Get another user's profile by ID. */
export const getUserProfile = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

/** Search users by username or full name. */
export const searchUsers = async (query, skip = 0, limit = 20) => {
  const response = await apiClient.get('/users/search', {
    params: { q: query, skip, limit },
  });
  return response.data;
};

/** Follow a user. */
export const followUser = async (userId) => {
  await apiClient.post(`/users/${userId}/follow`);
};

/** Unfollow a user. */
export const unfollowUser = async (userId) => {
  await apiClient.delete(`/users/${userId}/follow`);
};

/** Get a user's followers list. */
export const getFollowers = async (userId) => {
  const response = await apiClient.get(`/users/${userId}/followers`);
  return response.data;
};

/** Get list of users that a user follows. */
export const getFollowing = async (userId) => {
  const response = await apiClient.get(`/users/${userId}/following`);
  return response.data;
};

/** Get a user's posts. */
export const getUserPosts = async (userId, skip = 0, limit = 20) => {
  const response = await apiClient.get(`/users/${userId}/posts`, {
    params: { skip, limit },
  });
  return response.data;
};
