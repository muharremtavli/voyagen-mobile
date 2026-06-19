/**
 * VoyaGen — Posts API Module
 *
 * Feed (global & personalized), like/unlike, single post, and delete.
 */

import apiClient from './client';

/** Get the global feed (newest first, no auth required). */
export const getGlobalFeed = async (skip = 0, limit = 20, tag = null) => {
  const params = { skip, limit };
  if (tag) params.tag = tag;
  const response = await apiClient.get('/posts/', { params });
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

/** Update a post (own posts only). */
export const updatePost = async (postId, caption, tags) => {
  const response = await apiClient.patch(`/posts/${postId}`, {
    caption,
    tags,
  });
  return response.data;
};

/** Create a new post with image upload. */
export const createPost = async (imageUri, caption, tags) => {
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
  
  if (tags) {
    formData.append('tags', tags);
  }

  const response = await apiClient.post('/posts/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/** Get comments for a post */
export const getPostComments = async (postId) => {
  const response = await apiClient.get(`/posts/${postId}/comments`);
  return response.data;
};

/** Add a comment to a post */
export const createPostComment = async (postId, content) => {
  const response = await apiClient.post(`/posts/${postId}/comments`, { content });
  return response.data;
};

/** Save a post */
export const savePost = async (postId) => {
  await apiClient.post(`/posts/${postId}/save`);
};

/** Unsave a post */
export const unsavePost = async (postId) => {
  await apiClient.delete(`/posts/${postId}/save`);
};
