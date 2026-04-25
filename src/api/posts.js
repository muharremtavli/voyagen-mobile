/**
 * VoyaGen — Posts API Module
 *
 * Feed (global & personalized), like/unlike, single post, and delete.
 */

import apiClient from './client';

/** Get the global feed (newest first, no auth required). */
export const getGlobalFeed = async (skip = 0, limit = 20) => {
  const response = await apiClient.get('/posts/', {
    params: { skip, limit },
  });
  return response.data;
};

/** Get the personalized feed (posts from followed users, auth required). */
export const getPersonalFeed = async (skip = 0, limit = 20) => {
  const response = await apiClient.get('/posts/feed', {
    params: { skip, limit },
  });
  return response.data;
};

/** Get a single post by ID. */
export const getPost = async (postId) => {
  const response = await apiClient.get(`/posts/${postId}`);
  return response.data;
};

/** Like a post. */
export const likePost = async (postId) => {
  await apiClient.post(`/posts/${postId}/like`);
};

/** Unlike a post. */
export const unlikePost = async (postId) => {
  await apiClient.delete(`/posts/${postId}/like`);
};

/** Delete a post (own posts only). */
export const deletePost = async (postId) => {
  await apiClient.delete(`/posts/${postId}`);
};

/** Create a new post with image upload. */
export const createPost = async (imageUri, caption) => {
  const formData = new FormData();

  // Build file object for React Native
  const filename = imageUri.split('/').pop();
  const ext = filename.split('.').pop();
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  formData.append('file', {
    uri: imageUri,
    name: filename,
    type: mimeType,
  });

  if (caption) {
    formData.append('caption', caption);
  }

  const response = await apiClient.post('/posts/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
