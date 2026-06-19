import client from './client';

const ENDPOINT = '/messages';

export const getChatList = async () => {
  const response = await client.get(ENDPOINT + '/');
  return response.data;
};

export const getMessages = async (userId) => {
  const response = await client.get(`${ENDPOINT}/${userId}`);
  return response.data;
};

export const sendMessage = async (userId, content) => {
  const response = await client.post(`${ENDPOINT}/${userId}`, { content });
  return response.data;
};
