import apiClient from '@shared/services/apiClient';

export function listSales(params) {
  return apiClient.get('/sales', { params }).then((r) => r.data);
}

export function getSale(id) {
  return apiClient.get(`/sales/${id}`).then((r) => r.data.data);
}

export function createSale(payload) {
  return apiClient.post('/sales', payload).then((r) => r.data.data);
}
