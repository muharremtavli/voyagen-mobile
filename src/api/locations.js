/**
 * VoyaGen — Locations API Module
 *
 * Foursquare-powered place search, details, categories, and ratings.
 */

import apiClient from './client';

/** Search places via Foursquare (query, city, category). */
export const searchLocations = async (query = '', city = '', category = '', limit = 20) => {
  const response = await apiClient.get('/locations/search', {
    params: { query, city, category, limit },
  });
  return response.data;
};

/** Get available category filters. */
export const getCategories = async () => {
  const response = await apiClient.get('/locations/categories');
  return response.data;
};

/** Get place details with community ratings. */
export const getLocationDetail = async (fsqId) => {
  const response = await apiClient.get(`/locations/${fsqId}`);
  return response.data;
};

/** Rate a location (1-5 stars + optional comment). */
export const rateLocation = async (fsqId, score, comment = null) => {
  const response = await apiClient.post(`/locations/${fsqId}/rate`, {
    score,
    comment,
  });
  return response.data;
};

/** Get ratings list for a location. */
export const getLocationRatings = async (fsqId, skip = 0, limit = 20) => {
  const response = await apiClient.get(`/locations/${fsqId}/ratings`, {
    params: { skip, limit },
  });
  return response.data;
};
