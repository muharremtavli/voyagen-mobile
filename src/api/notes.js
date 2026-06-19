/**
 * VoyaGen — Smart Notes API Module
 */

import apiClient from './client';

export const generateNoteAI = async (locationName) => {
  const response = await apiClient.post('/notes/ai', { location_name: locationName });
  return response.data;
};

export const createNote = async (data) => {
  // data: { location_name, info, transport_option, stay_option, content }
  const response = await apiClient.post('/notes/', data);
  return response.data;
};

export const getMyNotes = async (skip = 0, limit = 50) => {
  const response = await apiClient.get('/notes/', { params: { skip, limit } });
  return response.data;
};

export const deleteNote = async (id) => {
  await apiClient.delete(`/notes/${id}`);
};
