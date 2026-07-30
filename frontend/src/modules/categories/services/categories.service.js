import apiClient from '@shared/services/apiClient';

export function listCategories(params) {
  return apiClient.get('/categories', { params }).then((r) => r.data.data);
}

export function getCategory(id) {
  return apiClient.get(`/categories/${id}`).then((r) => r.data.data);
}

export function createCategory(payload) {
  return apiClient.post('/categories', payload).then((r) => r.data.data);
}

export function updateCategory(id, payload) {
  return apiClient.put(`/categories/${id}`, payload).then((r) => r.data.data);
}

export function deleteCategory(id) {
  return apiClient.delete(`/categories/${id}`).then((r) => r.data?.data ?? null);
}
