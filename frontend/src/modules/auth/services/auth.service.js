import apiClient from '@shared/services/apiClient';

export function login({ username, password }) {
  return apiClient.post('/auth/login', { username, password }).then((r) => r.data.data);
}
