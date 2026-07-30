import apiClient from '@shared/services/apiClient';

export function listSuppliers(params) {
  return apiClient.get('/suppliers', { params }).then((r) => r.data.data);
}

export function getSupplier(id) {
  return apiClient.get(`/suppliers/${id}`).then((r) => r.data.data);
}

export function createSupplier(payload) {
  return apiClient.post('/suppliers', payload).then((r) => r.data.data);
}

export function updateSupplier(id, payload) {
  return apiClient.put(`/suppliers/${id}`, payload).then((r) => r.data.data);
}

export function deleteSupplier(id) {
  return apiClient.delete(`/suppliers/${id}`);
}
