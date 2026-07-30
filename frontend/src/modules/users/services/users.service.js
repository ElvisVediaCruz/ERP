import apiClient from '@shared/services/apiClient';

export function listUsers() {
  return apiClient.get('/users').then((r) => r.data.data);
}

export function getUser(id) {
  return apiClient.get(`/users/${id}`).then((r) => r.data.data);
}

export function updateUser(id, payload) {
  return apiClient.put(`/users/${id}`, payload).then((r) => r.data.data);
}

export function deactivateUser(id) {
  return apiClient.delete(`/users/${id}`);
}
