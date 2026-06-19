/**
 * VoyaGen — AI Routes API Module
 */

import apiClient from './client';

export const createRoute = async (data) => {
  const response = await apiClient.post('/routes/', data);
  return response.data;
};

export const getMyRoutes = async () => {
  const response = await apiClient.get('/routes/');
  return response.data;
};

export const getRoute = async (id) => {
  const response = await apiClient.get(`/routes/${id}`);
  return response.data;
};

export const deleteRoute = async (id) => {
  const response = await apiClient.delete(`/routes/${id}`);
  return response.data;
};
